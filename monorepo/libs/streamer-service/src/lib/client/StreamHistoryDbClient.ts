import { createDocClient } from "@hoagie/api-util";
import { PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { StreamData } from "@hoagie/service-clients";

export class StreamsDbClient {
    public static readonly CATEGORY = "STREAMS";

    private broadcasterId: string;
    private tableName: string;

    constructor(broadcasterId: string, tableName: string) {
        this.broadcasterId = broadcasterId;
        this.tableName = tableName;
    }

    public async setStreamHistory(stream: StreamData) {
        const client = createDocClient();
        const startDate = new Date(stream.started_at);
        try {
            const key = {
                CategoryKey: this.getKey(this.broadcasterId),
                SubKey: this.getSort(startDate),
            };

            const input: PutCommandInput = {
              TableName: this.tableName,
              Item: {
                  ...key,
                  streamId: stream.id,
                  stream,
                  startDate: startDate.toISOString(),
              },
          };

            const command = new PutCommand(input);
            console.log(JSON.stringify(input, null, 2));
            await client.send(command);
        } catch (err) {
            console.error(err);
        }
    }

    public async getStreamHistory(limit = 20): Promise<StreamData[]> {
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

    getKey(broadcasterId: string) {
        return `${StreamsDbClient.CATEGORY}_${broadcasterId}`;
    }

    getSort(date: Date) {
        return date.toISOString();
    }
}
