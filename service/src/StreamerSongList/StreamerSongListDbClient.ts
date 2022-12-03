import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export default class StreamerSongListDbClient {
    public static readonly SECRETS_CATEGORY = "SECRETS";
    public static readonly STREAMER_SONGLIST_SUBCAT = "streamerSongListToken";

    public static async setToken(username: string, token: string) {
        const client = new DynamoDB.DocumentClient();

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${username.toLowerCase()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
                Value: {
                    username: username,
                    token
                }
            }
        };
        const response = await client.put(request).promise();
    }

    public static async getToken(streamerName: string) {
        const client = new DynamoDB.DocumentClient();

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${streamerName.toLowerCase()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
            }
        }

        const response = await client.get(request).promise();
        return response?.Item;
    }
}