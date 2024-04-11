import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "./DBUtil";

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
        const client = createDocClient();

        const input = {
          TableName: this.tableName,
          Key: {
              CategoryKey: this.getKey(this.broadcasterId),
              SubKey: ModsDbClient.SUBCATEGORY
          }
        };
        const request: GetCommand = new GetCommand(input);
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
                    CategoryKey: this.getKey(this.broadcasterId),
                    SubKey: ModsDbClient.SUBCATEGORY,
                    mods,
                    channel: this.broadcasterId
                }
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

    public async addMod(userId: string) {
        try {
            const client = createDocClient();
            const input = new UpdateCommand({
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
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

    public async deleteMod(userId: string, indexToRemove: number) {
        try {
            const client = createDocClient();
            const input = new UpdateCommand({
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
            });
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

   getKey(channelId: string) {
        return `${ModsDbClient.CATEGORY}_${channelId}`;
    }
}
