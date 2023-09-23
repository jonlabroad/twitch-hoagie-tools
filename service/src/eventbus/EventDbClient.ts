import { DynamoDB } from "aws-sdk";
import Config from "../Config";

const defaultExpirySec = 60 * 24 * 60 * 60;

export interface TwitchEventType {
    source: string;
    detail: TwitchEventDetail;
}

export interface TwitchEventDetail {
    streamId: string;
    channel: string; // starts with #
    userstate: {
        id: string;
        "tmi-sent-ts": string;
    }
}

export class EventDbClient {
    public static readonly TWITCH_EVENT_CATEGORY = "TWITCH_EVENT";

    constructor() { }

    public async writeEvent(streamId: string, broadcasterId: string, event: TwitchEventType) {
        const client = new DynamoDB.DocumentClient();

        const date = new Date();
        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: this.createCategoryKey(streamId, broadcasterId),
                SubKey: event.detail.userstate.id,
                Type: event["detail-type"] ?? "UNKNOWN_DETAIL_TYPE",
                Value: {
                    ...event,
                    timestamp: date.getTime()
                },
                ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
            }
        };
        console.log({ request });
        const response = await client.put(request).promise();
        console.log(response);
    }

    public async readEvents(streamId: string, channel: string): Promise<TwitchEventType[]> {
        const client = new DynamoDB.DocumentClient();

        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.createCategoryKey(streamId, channel.toLowerCase())
            }
        }
        const response = await client.query(request).promise();
        return response?.Items?.map(item => item.Value) as TwitchEventType[];
    }

    private createCategoryKey(streamId: string, broadcasterId: string) {
        return `${EventDbClient.TWITCH_EVENT_CATEGORY}_${broadcasterId}_${streamId}`;
    }
}