import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
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

  /* TODO
  public async getStreamHistory(limit = 20): Promise<TwitchPlusStatusEntry[]> {
      const client = createDocClient();
      const input: QueryCommandInput = {
          TableName: this.tableName,
          KeyConditionExpression: "CategoryKey = :ckey",
          ExpressionAttributeValues: {
              ":ckey": this.getKey(this.broadcasterId)
          },
          ScanIndexForward: false, // descending order?
          Limit: limit,
      }
      console.log(JSON.stringify(input, null, 2));
      const command = new QueryCommand(input);
      const response = await client.send(command);
      return response.Items?.map(s => s["stream"]) ?? []
  }
*/

  getKey(broadcasterId: string) {
    return `${TwitchPlusStatusDBClient.CATEGORY}_${broadcasterId}`;
  }

  getSort(timestamp: string) {
    return timestamp;
  }
}
