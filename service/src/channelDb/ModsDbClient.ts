import { DynamoDB } from "aws-sdk";

export interface ModsData {
    mods: string[]
    channel: string
}

export default class ModsDbClient {
    public static readonly CATEGORY = "SETTINGS";
    public static readonly SUBCATEGORY = "MODS";

    private broadcasterId: string;
    private tableName: string;

    constructor(tableName: string, broadcasterId: string) {
        this.tableName = tableName;
        this.broadcasterId = broadcasterId;
    }

    public async readMods(): Promise<ModsData | undefined> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: {
                CategoryKey: this.getKey(this.broadcasterId),
                SubKey: ModsDbClient.SUBCATEGORY
            }
        };
        const response = await client.get(request).promise();
        console.log({ mods: response.Item});
        return (response?.Item) as ModsData | undefined;
    }

    public async writeMods(mods: string[]) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: this.tableName,
                Item: {
                    CategoryKey: this.getKey(this.broadcasterId),
                    SubKey: ModsDbClient.SUBCATEGORY,
                    mods,
                    channel: this.broadcasterId
                }
            };
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addMod(userId: string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: this.tableName,
                Key: {
                    CategoryKey: this.getKey(this.broadcasterId),
                    SubKey: ModsDbClient.SUBCATEGORY,
                },
                ConditionExpression: "not(contains(#listAttr, :newItem))",
                UpdateExpression: "SET #listAttr = list_append(if_not_exists(#listAttr, :emptyList), :newItem)",
                ExpressionAttributeNames: {
                    "#listAttr": "mods",
                },
                ExpressionAttributeValues: {
                    ":newItem": [userId],
                    ":emptyList": []
                },
            };
            console.log({ input });
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async deleteMod(userId: string, indexToRemove: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: this.tableName,
                Key: {
                    CategoryKey: this.getKey(this.broadcasterId),
                    SubKey: "mods",
                },
                ConditionExpression: `#listAttr[${indexToRemove}] = :valueToRemove`,
                UpdateExpression: `REMOVE #listAttr[${indexToRemove}]`,
                ExpressionAttributeNames: {
                    "#listAttr": "mods",
                },
                ExpressionAttributeValues: {
                    ":valueToRemove": userId,
                },
            };
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

   getKey(channelId: string) {
        return `${ModsDbClient.CATEGORY}_${channelId}`;
    }
}
