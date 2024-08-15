import { GetCommand, PutCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { EventBridgeEvent } from "aws-lambda";
import { SongListEvent } from "./client/StreamerSongListEventTypes";
import { createDocClient } from "./util/DBUtil";

const defaultExpirySec = 10 * 365 * 24 * 60 * 60;

export type SSLEvent = EventBridgeEvent<string, SongListEvent>;

export class SSLEventDBClient {
  constructor(private tableName: string) {}

  public async get(channelId: string, timestampMillisStart: number, timestampMillisEnd: number): Promise<SSLEvent[] | null> {
    try {
      const client = createDocClient();
      const commandData: QueryCommandInput = {
        TableName: this.tableName,
        KeyConditionExpression: "#CategoryKey = :categoryKey AND #SubKey BETWEEN :startTimestamp AND :endTimestamp",
        ExpressionAttributeNames: {
          "#CategoryKey": "CategoryKey",
          "#SubKey": "SubKey"
        },
        ExpressionAttributeValues: {
          ":categoryKey": this.createCachePrimaryKey(channelId),
          ":startTimestamp": timestampMillisStart.toString(),
          ":endTimestamp": timestampMillisEnd.toString()
        }
      };
      console.log(JSON.stringify(commandData, null, 2));
      const request: QueryCommand = new QueryCommand(commandData);
      const response = await client.send(request);
      return response.Items?.map(item => item?.["Value"]).filter(i => !!i) as SSLEvent[];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async set<T>(channelId: string, value: T, timestampMillis: number) {
    try {
      const client = createDocClient();
      const commandData = {
        TableName: this.tableName,
        Item: {
          CategoryKey: this.createCachePrimaryKey(channelId),
          SubKey: this.createCacheSortKey(timestampMillis),
          Value: value,
          ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec),
        },
      };
      console.log(commandData);
      const input = new PutCommand(commandData);
      return await client.send(input);
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  private createCachePrimaryKey(channelId: string) {
    return `SSL_LOG_${channelId}`.toUpperCase();
  }

  private createCacheSortKey(timestampMillis: number) {
    return `${timestampMillis}`;
  }
}
