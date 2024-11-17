import { SecretsProvider } from "@hoagie/secrets-provider"
import { StreamerSongListTokenDBClient } from "../client/StreamerSongListTokenDBClient";
import { createDocClient } from "../util/DBUtil";
import { StreamerSongListTokenRequest } from "../client/StreamerSongListApiClient";

export const StreamerSongListSetTokenHandler = async (token: StreamerSongListTokenRequest) => {
  const dbClient = await init();
  await dbClient.write({ token: token.token, timestamp: new Date().toISOString() });
}

export const StreamerSongListGetTokenHandler = async () => {
  const dbClient = await init();
  return await dbClient.read();
}

const init = async () => {
  if (!process.env["TABLENAME"]) {
    throw new Error('TABLENAME environment variable is required');
  }
  const tableName = process.env["TABLENAME"];

  await SecretsProvider.init();
  const dbClient = new StreamerSongListTokenDBClient(tableName, createDocClient());
  return dbClient;
}
