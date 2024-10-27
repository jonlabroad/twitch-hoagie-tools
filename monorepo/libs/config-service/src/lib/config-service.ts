import { AuthTokenDBClient, ModsDbClientV2 } from "@hoagie/api-util";
import { ConfigDBClient, TokenCategory } from "./client/ConfigDBClient";
import { TwitchAccessToken, TwitchClient } from "@hoagie/service-clients";
import { createTwitchClient } from "./createTwitchClient";
import { SecretsProvider } from "@hoagie/secrets-provider";
import { AccessTokenInfo } from "./AccessTokenInfo";

export interface PeriodicConfigUpdateProps {
  tableName: string;
  twitchClient: TwitchClient;
}

export async function periodicConfigUpdate(props: PeriodicConfigUpdateProps) {
  const configClient = new ConfigDBClient(props.tableName);

  // Get all mods from all channels
  const adminData = await configClient.getAdminData();
  if (!adminData) {
    throw new Error('No admin data found');
  }

  console.log({ adminData });

  const streamerLogins = [...adminData.streamers.values()];
  const streamerIds = (await Promise.all(streamerLogins.map(async (login) => {
    const userId = await props.twitchClient.getUserId(login);
    return userId;
  }))).filter(u => !!u) as string[];

  // Find channels each user mods
  const moddedChannelsByUserId: Record<string, string[]> = {};
  for (const streamerId of streamerIds) {
    console.log(`Checking mods for ${streamerId}`);
    const modsDbClient = new ModsDbClientV2(props.tableName, { broadcasterId: streamerId });
    const mods = await modsDbClient.readMods();
    for (const modId of mods?.mods || []) {
      const existingEntry = moddedChannelsByUserId[modId];
      if (!existingEntry) {
        moddedChannelsByUserId[modId] = [streamerId];
      } else {
        existingEntry.push(streamerId);
      }
    }
  }

  console.log({ moddedChannelsByUserId});

  for (const userId of Object.keys(moddedChannelsByUserId)) {
    await configClient.setUserStreamerIds(userId, moddedChannelsByUserId[userId]);
  }

  return "OK";
}

export async function saveAccessToken(tableName: string, authorizationToken: string, category: TokenCategory): Promise<boolean> {
  await SecretsProvider.init();
  if (!authorizationToken) {
    throw new Error('Authorization token must be provided');
  }

  const twitchClient = createTwitchClient();
  const redirectUrl = encodeURI(`https://config.hoagieman.net/api/v1/access/twitchtoken/${category}`);
  const accessToken = await twitchClient.getTokenFromAuthorizationCode(authorizationToken, redirectUrl);
  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const userData = await twitchClient.getUserDataByToken(accessToken.access_token);
  if (!userData) {
    throw new Error('Failed to get user data');
  }

  const configClient = new AuthTokenDBClient(tableName);
  await configClient.saveAccessToken(userData.id, accessToken, category.toUpperCase() as TokenCategory);

  return true;
}

export async function getAccessTokenInfo(tableName: string, userId: string): Promise<AccessTokenInfo[]> {
  const configClient = new AuthTokenDBClient(tableName);
  const accessTokens = await configClient.getAccessTokens(userId);
  return accessTokens.map(token => ({
    userId,
    scopes: token.scope,
  }));
}
