import { DonoData } from "../lib/DonoTypes";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "@hoagie/api-util";

const defaultExpirySec = 60 * 24 * 60 * 60;

export default class DonoDbClient {
    public static readonly CATEGORY = "DONO";

    private broadcasterId: string;
    private tableName: string;

    constructor(broadcasterId: string, tableName: string) {
        this.broadcasterId = broadcasterId;
        this.tableName = tableName;
    }

    public async readDonos(streamId: string): Promise<DonoData[]> {
        const client = createDocClient();

        const request = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId, streamId)
            }
        });
        console.log({ request })
        const response = await client.send(request);
        return (response?.Items ?? []) as DonoData[];
    }

    public async addDono(uuid: string, username: string, streamId: string, amount: number, userTwitchId: string | undefined) {
        await this.writeItem(this.createItem(uuid, username, streamId, "dono", amount, undefined, undefined, userTwitchId));
    }

    public async addHypechat(username: string, streamId: string, amount: number) {
        console.log("TODO");
    }

    public async addCheer(uuid: string, username: string, streamId: string, bits: number | string, userTwitchId: string | undefined) {
        await this.writeItem(this.createItem(uuid, username, streamId, "cheer", parseInt(bits.toString()), undefined, undefined, userTwitchId));
    }

    public async addSub(uuid: string, username: string, streamId: string, tier: string, userTwitchId: string | undefined) {
        await this.writeItem(this.createItem(uuid, username, streamId, "subscription", 1, tier, undefined, userTwitchId));
    }

    public async addGiftSubs(uuid: string, username: string, streamId: string, tier: string, recipient: string, userTwitchId: string | undefined) {
        await this.writeItem(this.createItem(uuid, username, streamId, "subgift", 1, tier, recipient, userTwitchId));
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

    createItem(uuid: string, username: string, streamId: string, type: string, amount: number, subTier?: string, subRecipient?: string, twitchUserId?: string) {
        const key = {
            CategoryKey: this.getKey(this.broadcasterId, streamId),
            SubKey: this.getSort(uuid),
        };
        return {
            ...key,
            username: username.toLowerCase(),
            streamId: streamId.toLowerCase(),
            broadcasterId: this.broadcasterId,
            amount,
            subTier,
            subRecipient,
            type,
            twitchUserId,
            timestamp: new Date().toISOString(),
            ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
        };
    }

    getKey(broadcasterId: string, streamId: string) {
        return `${DonoDbClient.CATEGORY}_${broadcasterId}_${streamId}`;
    }

    getSort(uuid: string) {
        return `${uuid}`;
    }
}
