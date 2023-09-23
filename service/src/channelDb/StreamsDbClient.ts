import { DynamoDB } from "aws-sdk";
import Config from "../Config";
import { StreamData } from "../twitch/TwitchClientTypes";

const defaultExpirySec = 60 * 24 * 60 * 60;

export interface DonoResponse {
    stream: {
        streamId: string,
        timestamp?: string
    },
}

export default class StreamsDbClient {
    public static readonly CATEGORY = "STREAMS";

    private broadcasterId: string;

    constructor(broadcasterId: string) {
        this.broadcasterId = broadcasterId;
    }

    public async setStreamHistory(stream: StreamData) {
        const client = new DynamoDB.DocumentClient();
        const startDate = new Date(stream.started_at);
        try {
            const key = {
                CategoryKey: this.getKey(this.broadcasterId),
                SubKey: this.getSort(startDate),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    streamId: stream.id,
                    stream,
                    startDate: startDate.toISOString(),
                },
            }
            console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async getStreamHistory(limit = 20): Promise<StreamData[]> {
        const client = new DynamoDB.DocumentClient();
        const request: DynamoDB.DocumentClient.QueryInput = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId)
            },
            ScanIndexForward: false, // descending order?
            Limit: limit,
        }
        console.log(JSON.stringify(request, null, 2));
        const response = await client.query(request).promise();
        return response.Items?.map(s => s.stream) ?? []
    }

    getKey(broadcasterId: string) {
        return `${StreamsDbClient.CATEGORY}_${broadcasterId}`;
    }

    getSort(date: Date) {
        return date.toISOString();
    }
}