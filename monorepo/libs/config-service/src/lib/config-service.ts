import { ModsDbClientV2 } from "@hoagie/api-util";
import { ConfigDBClient } from "./client/ConfigDBClient";
import { TwitchAccessToken, TwitchClient } from "@hoagie/service-clients";
import { createTwitchClient } from "./createTwitchClient";
import { SecretsProvider } from "@hoagie/secrets-provider";

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

export async function saveAccessToken(tableName: string, authorizationToken: string) {
  await SecretsProvider.init();
  if (!authorizationToken) {
    throw new Error('Authorization token must be provided');
  }

  const twitchClient = createTwitchClient();
  const accessToken = await twitchClient.getTokenFromAuthorizationCode(authorizationToken);
  if (!accessToken) {
    throw new Error('Failed to get access token');
  }

  const userData = await twitchClient.getUserDataByToken(accessToken.access_token);
  if (!userData) {
    throw new Error('Failed to get user data');
  }

  const configClient = new ConfigDBClient(tableName);
  await configClient.saveAccessToken(userData.id, accessToken, "USER");

  return "OK";
}
