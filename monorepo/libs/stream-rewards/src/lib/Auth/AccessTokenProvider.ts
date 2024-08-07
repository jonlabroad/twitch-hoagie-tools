import { TwitchAccessToken, TwitchClient } from "@hoagie/service-clients";
import { ConfigDBClient, TokenCategory } from "@hoagie/config-service";

export class AccessTokenProvider {
  private configDbClient: ConfigDBClient;
  private twitchClient: TwitchClient;

  constructor(configDbClient: ConfigDBClient, twitchClient: TwitchClient) {
    this.configDbClient = configDbClient;
    this.twitchClient = twitchClient
  }

  public async readToken(userId: string, tokenCategory: TokenCategory): Promise<string> {
    const token = await this.configDbClient.getAccessToken(userId, tokenCategory);
    const isValid = await this.isTokenValid(userId, token);
    if (isValid) {
      console.log(`Token valid for user ${userId}. Scopes ${token.scope.join(" ")}`);
      return token.access_token;
    } else {
      console.log(`Refreshing token for user ${userId}`);
      const tokenRefreshed = await this.refreshToken(userId, tokenCategory, token);
      if (tokenRefreshed) {
        console.log(`Token refreshed for user ${userId}. Scopes ${token.scope.join(" ")}`);
        return token.access_token;
      }
      console.error(`Token invalid and refresh failed for user ${userId}`);
      throw new Error("Token invalid and refresh failed");
    }
  }

  private async refreshToken(userId: string, tokenCategory: TokenCategory, token: TwitchAccessToken): Promise<boolean> {
    const refreshedToken = await this.twitchClient.refreshToken(token.refresh_token);
    if (refreshedToken) {
      await this.configDbClient.saveAccessToken(userId, refreshedToken, tokenCategory);
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
