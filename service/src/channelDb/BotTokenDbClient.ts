import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export interface BotTokenData {
    CategoryKey: string
    SubKey: string

    botToken: string
}

export default class BotTokenDbClient {
    public static readonly CATEGORY = "BotToken";

    constructor() {
    }

    public async read(streamerName: string): Promise<BotTokenData | undefined> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.GetItemInput = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: this.getKey(streamerName),
                SubKey: this.getSort(),
            }
        }
        const response = await client.get(request).promise();
        console.log(response);
        return response?.Item as BotTokenData;
    }

    public async set(botToken: string, streamerName: string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(streamerName),
                SubKey: this.getSort(),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    streamerName,
                    botToken,
                }
            }
            console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    getKey(streamerName: string) {
        return `${BotTokenDbClient.CATEGORY}_${streamerName.toLowerCase()}`;
    }

    getSort() {
        return `token`;
    }
}