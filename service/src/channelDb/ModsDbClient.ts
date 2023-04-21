import { DynamoDB } from "aws-sdk";
import Config from "../Config";

export interface ModsData {
    mods: string[]
    channel: string
}

export default class ModsDbClient {
    public static readonly CATEGORY = "DonoWatch";

    private broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin;
    }

    public async readMods(): Promise<ModsData | undefined> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.GetItemInput = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: this.getKey(this.broadcasterLogin),
                SubKey: "mods"
            }
        }
        const response = await client.get(request).promise();
        console.log({ mods: response.Item});
        return (response?.Item) as ModsData | undefined;
    }

    public async writeMods(mods: string[]) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    CategoryKey: this.getKey(this.broadcasterLogin),
                    SubKey: "mods",
                    mods,
                    channel: this.broadcasterLogin
                }
            }
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addMod(username: string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: {
                    CategoryKey: this.getKey(this.broadcasterLogin),
                    SubKey: "mods",
                },
                ConditionExpression: "not(contains(#listAttr, :newItem))",
                UpdateExpression: "SET #listAttr = list_append(if_not_exists(#listAttr, :emptyList), :newItem)",
                ExpressionAttributeNames: {
                    "#listAttr": "mods",
                },
                ExpressionAttributeValues: {
                    ":newItem": [username],
                    ":emptyList": []
                },
            }
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async deleteMod(username: string, indexToRemove: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: {
                    CategoryKey: this.getKey(this.broadcasterLogin),
                    SubKey: "mods",
                },
                ConditionExpression: `#listAttr[${indexToRemove}] = :valueToRemove`,
                UpdateExpression: `REMOVE #listAttr[${indexToRemove}]`,
                ExpressionAttributeNames: {
                    "#listAttr": "mods",
                },
                ExpressionAttributeValues: {
                    ":valueToRemove": username,
                },
            }
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

   getKey(channel: string) {
        return `DonoWatch_${channel.toLowerCase()}_config`;
    }
}