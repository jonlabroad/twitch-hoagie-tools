import { DynamoDB } from "aws-sdk";
import Config from "../Config";

const defaultExpirySec = 60 * 24 * 60 * 60;

export interface DonoDataV2 {
    CategoryKey: string
    SubKey: string
    username: string
    streamId: string
    broadcasterId: string
    amount: number
    subTier?: string
    subRecipient?: string
    type: string
    timestamp: string
    ExpirationTTL: number
}

export default class DonoDbClientV2 {
    public static readonly CATEGORY = "DONO";

    private broadcasterId: string;

    constructor(broadcasterId: string) {
        this.broadcasterId = broadcasterId;
    }

    public async readDonos(streamId: string): Promise<DonoDataV2[]> {
        const client = new DynamoDB.DocumentClient();

        const request: DynamoDB.DocumentClient.QueryInput = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterId, streamId)
            }
        }
        console.log({ request })
        const response = await client.query(request).promise();
        return (response?.Items ?? []) as DonoDataV2[];
    }

    public async addDono(uuid: string, username: string, streamId: string, amount: number) {
        await this.writeItem(this.createItem(uuid, username, streamId, "dono", amount));
    }

    public async addHypechat(username: string, streamId: string, amount: number) {
        console.log("TODO");
    }

    public async addCheer(uuid: string, username: string, streamId: string, bits: number | string) {
        await this.writeItem(this.createItem(uuid, username, streamId, "cheer", parseInt(bits.toString())));
    }

    public async addSub(uuid: string, username: string, streamId: string, tier: string) {
        await this.writeItem(this.createItem(uuid, username, streamId, "subscription", 1, tier));
    }

    public async addGiftSubs(uuid: string, username: string, streamId: string, tier: string, recipient: string) {
        await this.writeItem(this.createItem(uuid, username, streamId, "subgift", 1, tier, recipient));
    }

    async writeItem(item: any) {
        try {
            const client = new DynamoDB.DocumentClient();
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: item,
            }
            console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    createItem(uuid: string, username: string, streamId: string, type: string, amount: number, subTier?: string, subRecipient?: string) {
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
            timestamp: new Date().toISOString(),
            ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
        };
    }

    getKey(broadcasterId: string, streamId: string) {
        return `${DonoDbClientV2.CATEGORY}_${broadcasterId}_${streamId}`;
    }

    getSort(uuid: string) {
        return `${uuid}`;
    }
}