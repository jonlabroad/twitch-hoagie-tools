import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export interface EvalData {
    CategoryKey: string
    SubKey: string

    config: {
        whitelist: string[]
    }
}

export default class EvalDbClient {
    public static readonly CATEGORY = "SongEval";

    constructor() {
    }

    public async read(channel: string): Promise<EvalData | undefined> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.GetItemInput = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: this.getKey(channel),
                SubKey: this.getSort(),
            }
        }
        const response = await client.get(request).promise();
        console.log(response);
        return response?.Item as EvalData | undefined;
    }

    public async addWhitelistWord(channel: string, word: string): Promise<void> {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(channel),
                SubKey: this.getSort(),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "ADD whitelist :word",
                ExpressionAttributeValues: {
                    ":word": client.createSet([word]),
                }
            }
            console.log({input});
            await client.update(input).promise();
        }
        catch (err) {
            console.error(err);
        }
    }

    public async removeWhitelistWord(channel: string, word: string): Promise<void> {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(channel),
                SubKey: this.getSort(),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "DELETE whitelist :word",
                ExpressionAttributeValues: {
                    ":word": client.createSet([word]),
                }
            }
            console.log({input});
            await client.update(input).promise();
        }
        catch (err) {
            console.error(err);
        }
    }

    getKey(channel: string) {
        return `${EvalDbClient.CATEGORY}_${channel.toLowerCase()}`;
    }

    getSort() {
        return `config`;
    }
}