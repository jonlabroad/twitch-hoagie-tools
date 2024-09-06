import { DBResponseCache } from "@hoagie/api-util";
import { TwitchClient } from "@hoagie/service-clients";
import { createDocClient } from "./DBUtil";

const version = "1.0";
const defaultExpiry = 60 * 60 * 24 * 7 * 52;

export class TwitchUserIdProvider {
  private twitchClient: TwitchClient;
  private cache: DBResponseCache;

  constructor(twitchClient: TwitchClient, tableName: string) {
    this.twitchClient = twitchClient;
    this.cache = new DBResponseCache(createDocClient(), "TWITCHUSERID", tableName);
  }

  public async getUserId(login: string): Promise<string | undefined> {
    const key = this.getKey(login);
    const cached = await this.cache.get<string>(key, version);
    if (cached) {
      return cached;
    }

    const id = await this.twitchClient.getUserId(login);
    await this.cache.set(key, id, version, defaultExpiry);
    return id;
  }

  private getKey(login: string) {
    return `${login}`.toUpperCase();
  }
}
