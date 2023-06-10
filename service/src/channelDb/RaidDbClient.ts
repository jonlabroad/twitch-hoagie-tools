import { DynamoDB } from "aws-sdk";
import Config from "../Config";
import { RaidEvent } from "../eventsub/events/RaidEvent";

export default class RaidDbClient {
    public static readonly RAID_CATEGORY = "RAID";

    private broadcasterId: string;

    constructor(broadcasterId: string) {
        this.broadcasterId = broadcasterId;
    }

    public async writeRaid(raid: RaidEvent) {
        const client = new DynamoDB.DocumentClient();

        const date = new Date();
        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${this.broadcasterId}_${RaidDbClient.RAID_CATEGORY}`,
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

        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": `${this.broadcasterId}_${RaidDbClient.RAID_CATEGORY}`
            }
        }
        const response = await client.query(request).promise();
        return response?.Items?.map(item => item.Value) as RaidEvent[];
    }
}