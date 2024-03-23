import { GetCommand, PutCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "@hoagie/api-util";

const defaultExpirySec = 10 * 365 * 24 * 60 * 60;

export class SSLEventDBClient {
  constructor(private tableName: string) {}

  public async get<T>(channelId: string, timestampMillisStart: number, timestampMillisEnd: number): Promise<T[] | null> {
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
      return response.Items?.map(item => item?.["Value"]).filter(i => !!i) as T[];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async set<T>(channelId: string, value: T, timestampMillis: number) {
    try {
      const client = createDocClient();
      const input = new PutCommand({
        TableName: this.tableName,
        Item: {
          CategoryKey: this.createCachePrimaryKey(channelId),
          SubKey: this.createCacheSortKey(timestampMillis),
          Value: value,
          ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec),
        },
      });
      console.log(input);
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
