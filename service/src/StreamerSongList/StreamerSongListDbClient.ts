import { DynamoDB } from "aws-sdk";
import { PutItemInput } from "aws-sdk/clients/dynamodb";
import Config from "../Config";

import TwitchClient from "../twitch/TwitchClient";

export default class StreamerSongListDbClient {
    public static readonly SECRETS_CATEGORY = "SECRETS";
    public static readonly STREAMER_SONGLIST_SUBCAT = "streamerSongListToken";

    public static async setToken(username: string, token: string) {
        const client = new DynamoDB.DocumentClient();

        const userId = await (new TwitchClient()).getUserId(username);
        console.log(userId);

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${userId.toString()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
                Value: {
                    username: username,
                    token
                }
            }
        };
        const response = await client.put(request).promise();
        console.log(response);
    }

    public static async getToken(streamerName: string) {
        const client = new DynamoDB.DocumentClient();
        const userId = await (new TwitchClient()).getUserId(streamerName);

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${userId.toString()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
            }
        }
        console.log(request);

        const response = await client.get(request).promise();
        console.log({item: response?.Item});
        return response?.Item;
    }
}