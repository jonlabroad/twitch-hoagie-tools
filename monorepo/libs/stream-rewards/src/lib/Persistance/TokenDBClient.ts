import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "@hoagie/api-util";
import { RewardToken } from "../Tokens/RewardToken";

export default class TokenDbClient {
    public static readonly CATEGORY = "TOKENS";

    private broadcasterId: string;
    private tableName: string = process.env["TOKENTABLENAME"] ?? "";

    constructor(broadcasterId: string) {
        this.broadcasterId = broadcasterId;
    }

    public async writeToken(token: RewardToken) {
      const item = this.createItem(token);
      await this.writeItem(item);
    }

    public async readTokens(ownerId: string): Promise<RewardToken[]> {
        const client = createDocClient();

        const request = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId, ownerId)
            }
        });
        console.log({ request })
        const response = await client.send(request);
        return (response?.Items ?? []) as RewardToken[];
    }

    async writeItem(item: Record<string, any>) {
        try {
            const client = createDocClient();
            const input = new PutCommand({
                TableName: this.tableName,
                Item: item,
            });
            console.log(JSON.stringify(input, null, 2));
            await client.send(input);
        } catch (err) {
            console.error(err);
        }
    }

    private createItem(token: RewardToken) {
      const key = {
          CategoryKey: this.getKey(this.broadcasterId, token.ownerId),
          SubKey: this.getSort(token.key),
      };
      return {
          ...key,
          ...token,
      };
  }

    getKey(broadcasterId: string, ownerId: string) {
        return `${TokenDbClient.CATEGORY}_${broadcasterId}_${ownerId}`;
    }

    getSort(tokenKey: string) {
        return `${tokenKey}`;
    }
}
