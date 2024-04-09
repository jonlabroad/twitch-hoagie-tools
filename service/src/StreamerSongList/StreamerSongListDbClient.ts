import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export default class StreamerSongListDbClient {
    public static readonly SECRETS_CATEGORY = "SECRETS";
    public static readonly STREAMER_SONGLIST_SUBCAT = "streamerSongListToken";

    public static async setToken(streamerId: string, token: string) {
        const client = new DynamoDB.DocumentClient();

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${streamerId}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
                Value: {
                    userId: streamerId,
                    token
                }
            }
        };
        const response = await client.put(request).promise();
    }

    public static async getToken(streamerId: string) {
        const client = new DynamoDB.DocumentClient();

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${streamerId}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
            }
        }

        const response = await client.get(request).promise();
        return response?.Item;
    }
}