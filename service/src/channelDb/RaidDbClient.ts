import { DynamoDB } from "aws-sdk";
import Config from "../Config";
import { RaidEvent } from "../eventsub/events/RaidEvent";

import TwitchClient from "../twitch/TwitchClient";

export default class RaidDbClient {
    public static readonly RAID_CATEGORY = "RAID";

    private broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin;
    }

    public async writeRaid(raid: RaidEvent) {
        const client = new DynamoDB.DocumentClient();

        const broadcasterId = await (new TwitchClient()).getUserId(this.broadcasterLogin);

        const date = new Date();
        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${broadcasterId}_${RaidDbClient.RAID_CATEGORY}`,
                SubKey: date.toISOString(),
                Value: {
                    ...raid,
                    timestamp: date.getTime()
                }
            }
        };
        const response = await client.put(request).promise();
        console.log(response);
    }

    public async readRaids(): Promise<RaidEvent[]> {
        const client = new DynamoDB.DocumentClient();

        const broadcasterId = await (new TwitchClient()).getUserId(this.broadcasterLogin);

        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": `${broadcasterId}_${RaidDbClient.RAID_CATEGORY}`
            }
        }
        const response = await client.query(request).promise();
        return response?.Items?.map(item => item.Value) as RaidEvent[];
    }
}