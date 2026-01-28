// Options page script
console.log('Options page loaded');

//const YOUTUBE_CLIENT_ID = '360294299808-iqequqbflf9tfsfr6gghhil1hblrq76j.apps.googleusercontent.com'; // chrome extension
const YOUTUBE_CLIENT_ID = '360294299808-qpddue75gnqun3p3pr5a0efq6pd45fbo.apps.googleusercontent.com'; // web client

const YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    //'https://www.googleapis.com/auth/youtube.force-ssl'
];

interface YouTubeAuthState {
    accessToken?: string;
    expiresAt?: number;
    userInfo?: {
        id: string;
        name: string;
        email: string;
    };
}

class YouTubeAuth {
    private statusElement: HTMLElement;
    private connectButton: HTMLButtonElement;
    private disconnectButton: HTMLButtonElement;

    constructor() {
        this.statusElement = document.getElementById('youtube-status') as HTMLElement;
        this.connectButton = document.getElementById('connect-youtube') as HTMLButtonElement;
        this.disconnectButton = document.getElementById('disconnect-youtube') as HTMLButtonElement;

        this.connectButton.addEventListener('click', () => this.connect());
        this.disconnectButton.addEventListener('click', () => this.disconnect());

        this.init();
    }

    private async init() {
        await this.updateUI();
    }

    private async updateUI() {
        const authState = await this.getAuthState();
        
        if (authState.accessToken && this.isTokenValid(authState)) {
            this.showConnected(authState);
        } else {
            this.showDisconnected();
        }
    }

    private showConnected(authState: YouTubeAuthState) {
        this.statusElement.className = 'status connected';
        this.statusElement.textContent = `✓ Connected to YouTube${authState.userInfo ? ` as ${authState.userInfo.name}` : ''}`;
        this.connectButton.style.display = 'none';
        this.disconnectButton.style.display = 'inline-block';
    }

    private showDisconnected() {
        this.statusElement.className = 'status disconnected';
        this.statusElement.textContent = '✗ Not connected to YouTube';
        this.connectButton.style.display = 'inline-block';
        this.disconnectButton.style.display = 'none';
    }

    private showLoading(message: string) {
        this.statusElement.className = 'status loading';
        this.statusElement.textContent = message;
        this.connectButton.disabled = true;
    }

    private async connect() {
        try {
            this.showLoading('Connecting to YouTube...');

            // Use launchWebAuthFlow to allow account selection
            const redirectUrl = chrome.identity.getRedirectURL();
            
            const scopes = encodeURIComponent(YOUTUBE_SCOPES.join(' '));
            
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${YOUTUBE_CLIENT_ID}&` +
                `response_type=token&` +
                `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
                `scope=${scopes}&` +
                `prompt=select_account`; // Allow account selection

            const responseUrl = await new Promise<string>((resolve, reject) => {
                chrome.identity.launchWebAuthFlow(
                    {
                        url: authUrl,
                        interactive: true
                    },
                    (responseUrl) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else if (responseUrl) {
                            resolve(responseUrl);
                        } else {
                            reject(new Error('No response URL'));
                        }
                    }
                );
            });

            // Extract token from response URL
            const token = this.extractTokenFromUrl(responseUrl);
            if (!token) {
                throw new Error('Failed to extract token from response');
            }

            // Get user info
            const userInfo = await this.fetchUserInfo(token);

            // Save auth state
            const authState: YouTubeAuthState = {
                accessToken: token,
                expiresAt: Date.now() + (3600 * 1000), // 1 hour from now
                userInfo
            };

            await this.saveAuthState(authState);
            await this.updateUI();

            console.log('YouTube authentication successful');
        } catch (error) {
            console.error('YouTube authentication failed:', error);
            this.statusElement.className = 'status disconnected';
            this.statusElement.textContent = `✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.connectButton.disabled = false;
        }
    }

    private extractTokenFromUrl(url: string): string | null {
        // Extract access_token from fragment (after #)
        const match = url.match(/[#&]access_token=([^&]+)/);
        return match ? match[1] : null;
    }

    private async disconnect() {
        const authState = await this.getAuthState();
        
        // Revoke token on server
        if (authState.accessToken) {
            try {
                await fetch(`https://oauth2.googleapis.com/revoke?token=${authState.accessToken}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Failed to revoke token:', error);
            }
        }

        // Clear stored auth
        await chrome.storage.local.remove('youtubeAuth');
        await this.updateUI();
    }

    private async fetchUserInfo(token: string) {
        // Use YouTube API to get channel info
        const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch user info:', response.status, errorText);
            throw new Error(`Failed to fetch user info: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No YouTube channel found for this account');
        }

        const channel = data.items[0];
        return {
            id: channel.id,
            name: channel.snippet.title,
            email: '' // YouTube API doesn't provide email
        };
    }

    private async getAuthState(): Promise<YouTubeAuthState> {
        const result = await chrome.storage.local.get('youtubeAuth');
        return result.youtubeAuth || {};
    }

    private async saveAuthState(authState: YouTubeAuthState) {
        await chrome.storage.local.set({ youtubeAuth: authState });
    }

    private isTokenValid(authState: YouTubeAuthState): boolean {
        if (!authState.expiresAt) return false;
        return Date.now() < authState.expiresAt;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new YouTubeAuth());
} else {
    new YouTubeAuth();
}