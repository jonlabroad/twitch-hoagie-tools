import { createDocClient } from '@hoagie/api-util';
import { TwitchClient } from '@hoagie/service-clients';
import { SSLEventDBClient } from './SSLEventDBClient';

export class SSLEventDBWriter {
  tableName: string
  twitchClient: TwitchClient

  constructor(tableName: string, twitchClient: TwitchClient) {
    this.tableName = tableName;
    this.twitchClient = twitchClient;
  }

  public async writeEvent(ev: any) {
    const detail = ev.detail;
    const channelName = detail.channel;

    const userId = (await this.twitchClient.getUserId(channelName)) ?? 'ERROR';
    console.log({ channelName, userId });

    const timestampMillis = new Date(ev.time).getTime();
    const dbClient = new SSLEventDBClient(this.tableName);
    await dbClient.set(userId, ev, timestampMillis);

    console.log(ev);
    return {
      statusCode: 200,
      body: "cool",
    }
  }
}
