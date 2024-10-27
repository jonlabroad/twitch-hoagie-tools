import { DBResponseCache } from "@hoagie/api-util";
import { StreamData, TwitchClient } from "@hoagie/service-clients";
import { createDocClient } from "./DBUtil";

const version = "1.0";
const defaultExpirySec = 600;

export class TwitchBroadcasterLiveStreamProvider {
  private twitchClient: TwitchClient;
  private cache: DBResponseCache;

  constructor(twitchClient: TwitchClient, tableName: string) {
    this.twitchClient = twitchClient;
    this.cache = new DBResponseCache(createDocClient(), "TWITCHBROADCASTERLIVESTREAM", tableName);
  }

  public async getLiveStream(login: string): Promise<StreamData | undefined> {
    const key = this.getKey(login);
    const cached = await this.cache.get<StreamData>(key, version);
    if (cached) {
      return cached;
    }

    const stream = await this.twitchClient.getBroadcasterIdLiveStream(login);
    await this.cache.set(key, stream, version, defaultExpirySec);
    return stream;
  }

  private getKey(login: string) {
    return `${login}`.toUpperCase();
  }
}
