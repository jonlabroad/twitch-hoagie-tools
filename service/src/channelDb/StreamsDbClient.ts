import { DynamoDB } from "aws-sdk";
import Config from "../Config";

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

    public async getLatestStream(): Promise<{
        streamId: string,
        timestamp: string
    }> {
        const client = new DynamoDB.DocumentClient();
        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId)
            }
        }
        const response = await client.query(request).promise();
        const sorted = response?.Items?.sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime());
        const latest = sorted?.[0];
        return {
            streamId: latest?.SubKey,
            timestamp: latest?.timestamp,
        }
    }

    public async setStreamHistory(streamId: string) {
        const client = new DynamoDB.DocumentClient();
        try {
            const date = new Date();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId),
                SubKey: this.getSort(streamId),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #timestamp = if_not_exists(#timestamp, :timestamp)",
                ExpressionAttributeNames: { "#timestamp": "timestamp" },
                ExpressionAttributeValues: {
                    ":timestamp": { S: date.toISOString() },
                }
            }
            console.log(JSON.stringify(input, null, 2));
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async getStreamHistory(): Promise<{
        streamId: string,
        timestamp: string,
    }[]> {
        const client = new DynamoDB.DocumentClient();
        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId)
            }
        }
        const response = await client.query(request).promise();
        const sorted = response?.Items?.sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime());
        return sorted?.map(s => ({
            streamId: s?.SubKey,
            timestamp: s?.timestamp,
        })) ?? []
    }

    getKey(broadcasterId: string) {
        return `${StreamsDbClient.CATEGORY}_${broadcasterId}`;
    }

    getSort(streamId: string) {
        return streamId;
    }
}