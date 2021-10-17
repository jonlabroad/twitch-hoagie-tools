import { DynamoDB } from "aws-sdk";
import { PutItemInput } from "aws-sdk/clients/dynamodb";
import Config from "../Config";
import { RaidEvent } from "../eventsub/events/RaidEvent";

import TwitchClient from "../twitch/TwitchClient";

export default class RaidDbClient {
    public static readonly RAID_CATEGORY = "RAID";
    public static readonly STREAMER_SONGLIST_SUBCAT = "streamerSongListToken";

    private broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin;
    }

    public async writeRaid(raid: RaidEvent) {
        const client = new DynamoDB.DocumentClient();

        const broadcasterId = await (new TwitchClient()).getUserId(this.broadcasterLogin);

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${broadcasterId}_${RaidDbClient.RAID_CATEGORY}`,
                SubKey: new Date().toISOString(),
                Value: {
                    ...raid
                }
            }
        };
        const response = await client.put(request).promise();
        console.log(response);
    }

    public async readRaids(): Promise<RaidEvent[]> {
        const client = new DynamoDB.DocumentClient();

        const broadcasterId = (await new TwitchClient()).getUserId(this.broadcasterLogin);

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${broadcasterId}_${RaidDbClient.RAID_CATEGORY}`,
            }
        }

        const response = await client.query(request).promise();
        return response?.Items as RaidEvent[];
    }
}