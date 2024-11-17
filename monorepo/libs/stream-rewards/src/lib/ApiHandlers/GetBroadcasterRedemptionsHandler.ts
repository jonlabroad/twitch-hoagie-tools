import { AccessTokenProvider, AuthTokenDBClient } from "@hoagie/api-util";
import { createTwitchClient } from "../createTwitchClient";
import { CustomReward } from "@hoagie/service-clients";
import { SecretsProvider } from "@hoagie/secrets-provider";

export class GetBroadcasterRedemptionsHandler {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async handle(broadcasterId: string): Promise<CustomReward[]> {
    await SecretsProvider.init();

    const twitchClient = createTwitchClient();
    const authDbClient = new AuthTokenDBClient(this.tableName);
    const accessTokenProvider = new AccessTokenProvider(authDbClient, twitchClient);
    const broadcasterToken = await accessTokenProvider.readToken(broadcasterId, "REWARDS");
    if (!broadcasterToken) {
      throw new Error(`No token found for broadcaster ${broadcasterId}`);
    }

    const response = await twitchClient.getCustomRedemptions(broadcasterId, broadcasterToken.access_token);
    return response?.data ?? [];
  }
}
