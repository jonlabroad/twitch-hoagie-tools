import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "./DBUtil";

export interface ModsData {
    mods: string[]
    channel: string
}

export default class ModsDbClient {
    public static readonly CATEGORY = "DonoWatch";

    private broadcasterLogin: string;
    private tableName: string;

    constructor(tableName: string, broadcasterLogin: string) {
        this.tableName = tableName;
        this.broadcasterLogin = broadcasterLogin;
    }

    public async readMods(): Promise<ModsData | undefined> {
        const client = createDocClient();

        const request: GetCommand = new GetCommand({
            TableName: this.tableName,
            Key: {
                CategoryKey: this.getKey(this.broadcasterLogin),
                SubKey: "mods"
            }
        });
        const response = await client.send(request);
        console.log({ mods: response.Item});
        return (response?.Item) as ModsData | undefined;
    }

    public async writeMods(mods: string[]) {
        try {
            const client = createDocClient();
            const input = new PutCommand({
                TableName: this.tableName,
                Item: {
                    CategoryKey: this.getKey(this.broadcasterLogin),
                    SubKey: "mods",
                    mods,
                    channel: this.broadcasterLogin
                }
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

    public async addMod(username: string) {
        try {
            const client = createDocClient();
            const input = new UpdateCommand({
                TableName: this.tableName,
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
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

    public async deleteMod(username: string, indexToRemove: number) {
        try {
            const client = createDocClient();
            const input = new UpdateCommand({
                TableName: this.tableName,
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
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

   getKey(channel: string) {
        return `DonoWatch_${channel.toLowerCase()}_config`;
    }
}
