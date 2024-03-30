import { createDocClient } from '@hoagie/api-util';
import { TwitchClient } from '@hoagie/service-clients';
import { SSLEventDBClient } from './SSLEventDBClient';
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { EventBridgeEvent } from 'aws-lambda';

export class SSLEventDBWriter {
  tableName: string
  twitchClient: TwitchClient

  constructor(tableName: string, twitchClient: TwitchClient) {
    this.tableName = tableName;
    this.twitchClient = twitchClient;
  }

  public async writeEvent(ev: EventBridgeEvent<string, any> ) {
    const detail = ev.detail;
    const channelName = detail.channel;

    const userId = (await this.twitchClient.getUserId(channelName)) ?? 'ERROR';

    const timestampMillis = new Date().getTime();
    const dbClient = new SSLEventDBClient(this.tableName);
    await dbClient.set(userId, ev, timestampMillis);

    console.log(ev);
    return {
      statusCode: 200,
      body: "cool",
    }
  }
}
