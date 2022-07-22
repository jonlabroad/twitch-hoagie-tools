import axios from "axios";
import { URLSearchParams } from "url";

export interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface SearchResponse {
    tracks: {
        href: string
        items: SpotifySong[]
    }
}

export interface AudioAnalysisResponse {
    track: {
        loudness: number
        tempo: number
        tempo_confience: number
        time_signature: number
        time_signature_confidence: number
        key: number
        key_confidence: number
    }
}

export interface SpotifySong {
    album: SpotifyAlbum
    artists: SpotifyArtist[]
    href: string
    name: string
    uri: string
    popularity: number
    id: string
}

export interface SpotifyAlbum {
    name: string
    uri: string
}

export interface SpotifyArtist {
    name: string
    uri: string
    href: string
}

export interface SpotifyProfile {
    "country": string,
    "display_name": string,
    "email": string
    "explicit_content": {
        "filter_enabled": boolean,
        "filter_locked": boolean
    },
    "external_urls": {
        "spotify": string
    },
    "followers": {
        "href": string | null,
        "total": number
    },
    "href": string
    "id": string
    "images": string[],
    "product": string
    "type": string
    "uri": string
}

export interface SpotifyPlaylist {
    collaborative: boolean,
    description: string
    external_urls: string[]
    followers: string[],
    href: string
    id: string
    images: string[],
    name: string
    owner: string[]
    primary_color: string,
    public: boolean,
    snapshot_id: string
    tracks: any[],
    type: string
    uri: string
}

export default class SpotifyClient {
    public async getToken(grantType: string, code: string, redirectUri: string) {
        const params = new URLSearchParams();
        params.append("grant_type", grantType);
        params.append("code", code);
        params.append("redirect_uri", redirectUri);
        const url = "https://accounts.spotify.com/api/token";
        console.log(url);
        const response = await axios.post<TokenResponse>(url, params as any, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            }
        });
        const tokenData = response.data;
        return tokenData;
    }

    public async refreshToken(refreshToken: string) {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        const url = "https://accounts.spotify.com/api/token";
        console.log(url);
        console.log(params);
        try {
            const response = await axios.post<TokenResponse>(url, params as any, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
                }
            });
            const tokenData = response.data;
            return tokenData;
        } catch (err) {
            throw new Error(`Could get new token: ${err.message}`);
        }
    }

    public async getSong(token: string, artist: string, title: string) {
        const url = `https://api.spotify.com/v1/search?type=track&q=artist:${encodeURIComponent(artist)}+track:${encodeURIComponent(title)}`;
        console.log(url);
        try {
            const response = await axios.get<SearchResponse>(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            console.log(err.message);
        }
        return undefined;
    }

    public async getAudioAnalysis(token: string, trackId: string) {
        const url = `https://api.spotify.com/v1/audio-analysis/${trackId}`;
        console.log(url);
        const response = await axios.get<AudioAnalysisResponse>(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    }

    public async getUserProfile(token: string) {
        const url = "https://api.spotify.com/v1/me";
        console.log(url);
        const response = await axios.get<SpotifyProfile>(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    }

    public async getUserId(token: string) {
        const profile = await this.getUserProfile(token);
        return profile.id;
    }

    public async createPlaylist(userToken: string, userId: string, playlistName: string) {
        const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
        console.log(url);
        const response = await axios.post<any, any>(url, {
            name: playlistName,
            description: "Streamersonglist Playlist",
            public: true
        },
            {
                headers: {
                    "Authorization": `Bearer ${userToken}`
                }
            }
        );
        console.log(response.data);
        return response.data as SpotifyPlaylist;
    }

    public async getPlaylist(userToken: string, playlistId: string) {
        const uri = `https://api.spotify.com/v1/playlists/${playlistId}`;
        const response = await axios.get<SpotifyPlaylist>(uri, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });
        return response.data;
    }

    public async addPlaylistTracks(userToken: string, playlistId: string, trackUris: string[]) {
        const url = `	https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackUris.join(',')}`;
        console.log(url);
        const response = await axios.post<any, any>(url, {}, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        }
        );
        return response.data;
    }

    public async getUrl(userToken: string, url: string) {
        console.log(url);
        const response = await axios.get<any, any>(url, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        }
        );
        return response.data;
    }
}