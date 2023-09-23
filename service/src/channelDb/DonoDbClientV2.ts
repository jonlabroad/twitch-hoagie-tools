import { DynamoDB } from "aws-sdk";
import { stringify } from "querystring";
import { SetDonoRequest } from "../../twitch-dono";
import Config from "../Config";
import * as tmi from "tmi.js";
import { DonoDataV2, DonoResponseV2 } from "./DonoDbClient";

const defaultExpirySec = 60 * 24 * 60 * 60;

export interface DonoData {
    SubKey: string
    dono: number;
    cheer: number
    hypechat: number
    data: any
    sub: number
    subgift: number
    value: number
    tier: number | undefined
}

export interface DonoResponse {
    stream: {
        streamId: string,
        timestamp?: string
    },
    donos: DonoData[]
}

export default class DonoDbClientV2 {
    public static readonly CATEGORY = "DONO";

    private broadcasterId: string;

    constructor(broadcasterId: string) {
        this.broadcasterId = broadcasterId;
    }

    public async readDonos(streamId: string): Promise<DonoResponseV2> {
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
        console.log({ items: response?.Items })
        return {
            stream: {
                streamId: streamId,
            },
            donos: (response?.Items ?? []) as DonoDataV2[]
        };
    }

    public async addDono(uuid: string, username: string, streamId: string, amount: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId, streamId),
                SubKey: this.getSort(uuid),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    dono: amount,
                    username: username.toLowerCase(),
                    streamId: streamId.toLowerCase(),
                    broadcasterId: this.broadcasterId,
                    type: "dono",
                    timestamp: new Date().toISOString(),
                    ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
                },
            }
            console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addHypechat(username: string, streamId: string, amount: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId, streamId),
                SubKey: this.getSort(username),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #hypechat = if_not_exists(#hypechat, :start) + :amount, #data = :data, #ExpirationTTL = :expiration",
                ExpressionAttributeNames: { "#hypechat": "hypechat", "#data": "data", "#ExpirationTTL": "ExpirationTTL" },
                ExpressionAttributeValues: {
                    ":amount": amount,
                    ":start": 0,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterId,
                        type: "hypechat",
                        timestamp: new Date().toISOString(),
                    },
                    ":expiration": Math.floor(Date.now() / 1e3 + defaultExpirySec)
                }
            }
            console.log(JSON.stringify(input, null, 2));
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addCheer(uuid: string, username: string, streamId: string, bits: number | string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId, streamId),
                SubKey: this.getSort(uuid),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    cheer: parseInt(bits.toString()),
                    username: username.toLowerCase(),
                    streamId: streamId.toLowerCase(),
                    broadcasterId: this.broadcasterId,
                    type: "cheer",
                    timestamp: new Date().toISOString(),
                    ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
                },
            }
            //console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addSub(uuid: string, username: string, streamId: string, tier: string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId, streamId),
                SubKey: this.getSort(uuid),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    sub: 1,
                    username: username.toLowerCase(),
                    streamId: streamId.toLowerCase(),
                    broadcasterId: this.broadcasterId,
                    tier,
                    type: "subscription",
                    timestamp: new Date().toISOString(),
                    ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
                },
            }
            //console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addGiftSubs(uuid: string, username: string, streamId: string, tier: string, recipient: string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterId, streamId),
                SubKey: this.getSort(uuid),
            };
            const input: DynamoDB.DocumentClient.PutItemInput = {
                TableName: Config.tableName,
                Item: {
                    ...key,
                    username: username.toLowerCase(),
                    streamId: streamId.toLowerCase(),
                    broadcasterId: this.broadcasterId,
                    tier,
                    recipient,
                    type: "subgift",
                    timestamp: new Date().toISOString(),
                    ExpirationTTL: Math.floor(Date.now() / 1e3 + defaultExpirySec)
                },
            }
            //console.log(JSON.stringify(input, null, 2));
            await client.put(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    getKey(broadcasterId: string, streamId: string) {
        return `${DonoDbClientV2.CATEGORY}_${broadcasterId}_${streamId}`;
    }

    getSort(uuid: string) {
        return `${uuid}`;
    }
}