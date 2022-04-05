import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export interface AdminData {
    CategoryKey: string
    SubKey: string

    chatUsername: string
    chatToken: string
    streamers: {
        values: string[]
    }
}

export default class AdminDbClient {
    public static readonly CATEGORY = "DonoWatch";

    constructor() {
    }

    public async read(): Promise<AdminData | undefined> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.GetItemInput = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: this.getKey(),
                SubKey: this.getSort(),
            }
        }
        const response = await client.get(request).promise();
        console.log(response);
        return response?.Item as AdminData;
    }

    public async set(config: AdminData) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(),
                SubKey: this.getSort(),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    ...config,
                }
            }
            console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async setStreamers(streamers: string[]) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(),
                SubKey: this.getSort(),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #streamers = :streamers",
                ExpressionAttributeNames: { "#streamers": "streamers" },
                ExpressionAttributeValues: {
                    ":streamers": client.createSet(streamers),
                }
            }
            console.log(JSON.stringify(input, null, 2));
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    getKey() {
        return `DonoWatch_admin`;
    }

    getSort() {
        return `config`;
    }
}