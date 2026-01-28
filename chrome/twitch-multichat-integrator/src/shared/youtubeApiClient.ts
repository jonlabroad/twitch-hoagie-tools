/**
 * YouTube Live Chat API Client
 * Handles interactions with YouTube's Live Chat API for moderation actions
 */

export interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

export class YouTubeApiClient {
  private accessToken: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Delete a specific chat message
   * @param messageId The ID of the chat message to delete
   */
  async deleteMessage(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/liveChat/messages?id=${encodeURIComponent(messageId)}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error: YouTubeApiError = await response.json();
      throw new Error(`Failed to delete message: ${error.error.message}`);
    }
  }

  /**
   * Ban a user from the live chat
   * @param liveChatId The ID of the live chat
   * @param channelId The channel ID of the user to ban
   * @param banDurationSeconds Duration of the ban in seconds (optional, permanent if not specified)
   */
  async banUser(
    liveChatId: string, 
    channelId: string, 
    banDurationSeconds?: number
  ): Promise<void> {
    const url = `${this.baseUrl}/liveChat/bans?part=snippet`;
    
    const body: any = {
      snippet: {
        liveChatId: liveChatId,
        type: banDurationSeconds ? 'temporary' : 'permanent',
        bannedUserDetails: {
          channelId: channelId
        }
      }
    };

    if (banDurationSeconds) {
      body.snippet.banDurationSeconds = banDurationSeconds.toString();
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error: YouTubeApiError = await response.json();
      throw new Error(`Failed to ban user: ${error.error.message}`);
    }
  }

  /**
   * Timeout a user (temporary ban)
   * @param liveChatId The ID of the live chat
   * @param channelId The channel ID of the user to timeout
   * @param durationSeconds Duration of the timeout in seconds (default: 300 = 5 minutes)
   */
  async timeoutUser(
    liveChatId: string,
    channelId: string,
    durationSeconds: number = 300
  ): Promise<void> {
    return this.banUser(liveChatId, channelId, durationSeconds);
  }

  /**
   * Update the access token
   * @param token New access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}
