import { AuthTokenDBClient, TokenCategory } from "@hoagie/api-util";
import { TwitchAccessToken, TwitchClient } from "@hoagie/service-clients";

export class AccessTokenProvider {
  private authTokenDBClient: AuthTokenDBClient;
  private twitchClient: TwitchClient;

  constructor(configDbClient: AuthTokenDBClient, twitchClient: TwitchClient) {
    this.authTokenDBClient = configDbClient;
    this.twitchClient = twitchClient
  }

  public async readToken(userId: string, tokenCategory: TokenCategory): Promise<TwitchAccessToken | undefined> {
    const token = await this.authTokenDBClient.getAccessToken(userId, tokenCategory);
    if (!token) {
      console.log(`No token found for user ${userId}`);
      return undefined;
    }

    const isValid = await this.isTokenValid(userId, token);
    if (isValid) {
      console.log(`Token valid for user ${userId}. Scopes ${token.scope.join(" ")}`);
      return token;
    } else {
      console.log(`Refreshing token for user ${userId}`);
      const tokenRefreshed = await this.refreshToken(userId, tokenCategory, token);
      if (tokenRefreshed) {
        console.log(`Token refreshed for user ${userId}. Scopes ${token.scope.join(" ")}`);
        return token;
      }
      console.error(`Token invalid and refresh failed for user ${userId}`);
      throw new Error("Token invalid and refresh failed");
    }
  }

  private async refreshToken(userId: string, tokenCategory: TokenCategory, token: TwitchAccessToken): Promise<boolean> {
    const refreshedToken = await this.twitchClient.refreshToken(token.refresh_token);
    if (refreshedToken) {
      await this.authTokenDBClient.saveAccessToken(userId, refreshedToken, tokenCategory);
      return true;
    }
    return false;
  }

  private async isTokenValid(userId: string, token: TwitchAccessToken): Promise<boolean> {
    const validationResult = await TwitchClient.validateUserIdAndToken(userId, token.access_token);
    if (validationResult.validated) {
      return true;
    }
    return false;
  }
}
