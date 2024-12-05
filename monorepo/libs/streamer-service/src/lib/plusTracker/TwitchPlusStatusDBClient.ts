import { PutCommand, PutCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createDocClient } from '../util/DBUtil';

export interface TwitchPlusStatusEntry {
  broadcasterId: string;
  month: number;
  year: number;
  timestamp: string;
  value: number;
}

export class TwitchPlusStatusDBClient {
  public static readonly CATEGORY = 'TWITCHPLUS';

  private broadcasterId: string;
  private tableName: string;

  constructor(broadcasterId: string, tableName: string) {
    this.broadcasterId = broadcasterId;
    this.tableName = tableName;
  }

  public async set(status: TwitchPlusStatusEntry) {
    const client = createDocClient();
    try {
      const key = {
        CategoryKey: this.getKey(this.broadcasterId),
        SubKey: this.getSort(status.timestamp),
      };

      const input: PutCommandInput = {
        TableName: this.tableName,
        Item: {
          ...key,
          ...status,
        },
      };

      const command = new PutCommand(input);
      console.log(JSON.stringify(input, null, 2));
      await client.send(command);
    } catch (err) {
      console.error(err);
    }
  }

  public async query(broadcasterId: string): Promise<TwitchPlusStatusEntry[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startTime = sixMonthsAgo.toISOString();

    const client = createDocClient();
    const input = {
      TableName: this.tableName,
      KeyConditionExpression: 'CategoryKey = :ckey AND SubKey >= :start',
      ExpressionAttributeValues: {
        ':ckey': this.getKey(broadcasterId),
        ':start': startTime,
      },
    };

    console.log(JSON.stringify(input, null, 2));
    const command = new QueryCommand(input);
    const response = await client.send(command);

    return (response.Items ?? []) as TwitchPlusStatusEntry[];
  }

  getKey(broadcasterId: string) {
    return `${TwitchPlusStatusDBClient.CATEGORY}_${broadcasterId}`;
  }

  getSort(timestamp: string) {
    return timestamp;
  }
}
