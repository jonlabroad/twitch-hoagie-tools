import { DynamoDB } from "aws-sdk";
import { stringify } from "querystring";
import { SetDonoRequest } from "../../twitch-dono";
import Config from "../Config";

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

export default class DonoDbClient {
    public static readonly CATEGORY = "DonoWatch";

    private broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin;
    }

    public async readLatestDonos(): Promise<DonoResponse> {
        const client = new DynamoDB.DocumentClient();

        // Get latest stream id
        const latestStream = await this.getLatestStream();
        const latestStreamId = latestStream.streamId;
        if (latestStreamId) {
            const request: any = {
                TableName: Config.tableName,
                KeyConditionExpression: "CategoryKey = :ckey",
                ExpressionAttributeValues: {
                    ":ckey": this.getKey(this.broadcasterLogin, latestStreamId)
                }
            }
            const response = await client.query(request).promise();
            return {
                stream: {
                    streamId: latestStreamId,
                    timestamp: latestStream.timestamp,
                },
                donos: (response?.Items ?? []) as DonoData[]
            };
        }
        return {
            stream: {
                streamId: "",
                timestamp: ""
            },
            donos: []
        };
    }

    public async readDonos(streamId: string): Promise<DonoResponse> {
        const client = new DynamoDB.DocumentClient();

        // Get latest stream id
        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": this.getKey(this.broadcasterLogin, streamId)
            }
        }
        const response = await client.query(request).promise();
        return {
            stream: {
                streamId: streamId,
            },
            donos: (response?.Items ?? []) as DonoData[]
        };
    }

    public async add(request: SetDonoRequest) {
        try {
            const latestStream = await this.getLatestStream();
            const latestStreamId = latestStream.streamId;
            if (latestStreamId) {
                switch (request.type) {
                    case "cheer":
                        console.log("Adding cheer");
                        return await this.addCheer(request.userLogin, latestStreamId, request.amount);
                    case "dono":
                        console.log("Adding dono");
                        return await this.addDono(request.userLogin, latestStreamId, request.amount);
                    case "sub":
                        console.log("Adding sub");
                        return await this.addSub(request.userLogin, latestStreamId, request.tier ?? 1);
                    case "subgift":
                        console.log("Adding subgift");
                        return await this.addGiftSubs(request.userLogin, latestStreamId, request.tier ?? 1);
                    case "hypechat":
                        console.log("Adding hypechat");
                        return await this.addHypechat(request.userLogin, latestStreamId, request.amount);    
                    default:
                        console.error(`Do not understand dono type ${request.type}`);
                }
            }
        } catch (err) {
            console.error(err);
            return {
                request,
                success: false
            }
        }
    }

    public async addDono(username: string, streamId: string, amount: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterLogin, streamId),
                SubKey: this.getSort(username),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #dono = if_not_exists(#dono, :start) + :amount, #data = :data, #ExpirationTTL = :expiration",
                ExpressionAttributeNames: { "#dono": "dono", "#data": "data", "#ExpirationTTL": "ExpirationTTL" },
                ExpressionAttributeValues: {
                    ":amount": amount,
                    ":start": 0,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
                    ":expiration": Math.floor(Date.now() / 1e3 + defaultExpirySec)
                }
            }
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addHypechat(username: string, streamId: string, amount: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterLogin, streamId),
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
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
                    ":expiration": Math.floor(Date.now() / 1e3 + defaultExpirySec)
                }
            }
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addCheer(username: string, streamId: string, bits: number | string) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterLogin, streamId),
                SubKey: this.getSort(username),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #cheer = if_not_exists(#cheer, :start) + :bits, #data = :data, #ExpirationTTL = :expiration",
                ExpressionAttributeNames: { "#cheer": "cheer", "#data": "data", "#ExpirationTTL": "ExpirationTTL" },
                ExpressionAttributeValues: {
                    ":bits": parseInt(bits.toString()),
                    ":start": 0,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
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

    public async addSub(username: string, streamId: string, tier: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const key = {
                CategoryKey: this.getKey(this.broadcasterLogin, streamId),
                SubKey: this.getSort(username),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #sub = :sub, #data = :data, #tier = :tier, #ExpirationTTL = :expiration",
                ExpressionAttributeNames: { "#sub": "sub", "#data": "data", "#tier": "tier", "#ExpirationTTL": "ExpirationTTL" },
                ExpressionAttributeValues: {
                    ":sub": 1,
                    ":tier": tier,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
                    ":expiration": Math.floor(Date.now() / 1e3 + defaultExpirySec)
                }
            }
            console.log({ input });
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async addGiftSubs(username: string, streamId: string, tier: number) {
        try {
            const client = new DynamoDB.DocumentClient();
            const subs = 1;
            const key = {
                CategoryKey: this.getKey(this.broadcasterLogin, streamId),
                SubKey: this.getSort(username),
            };
            const input: DynamoDB.DocumentClient.UpdateItemInput = {
                TableName: Config.tableName,
                Key: key,
                UpdateExpression: "SET #subgift = if_not_exists(#subgift, :start) + :subs, #data = :data, #tier = :tier, #ExpirationTTL = :expiration",
                ExpressionAttributeNames: { "#subgift": "subgift", "#data": "data", "#tier": "tier", "#ExpirationTTL": "ExpirationTTL" },
                ExpressionAttributeValues: {
                    ":start": 0,
                    ":subs": subs,
                    ":tier": tier,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
                    ":expiration": Math.floor(Date.now() / 1e3 + defaultExpirySec)
                }
            }
            await client.update(input).promise();
        } catch (err) {
            console.error(err);
        }
    }

    public async getLatestStream(): Promise<{
        streamId: string,
        timestamp: string
    }> {
        const client = new DynamoDB.DocumentClient();
        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": `DonoWatch_${this.broadcasterLogin.toLowerCase()}_streamhistory`
            }
        }
        const response = await client.query(request).promise();
        const sorted = response?.Items?.sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime());
        const latest = sorted?.[0];
        return {
            streamId: latest?.SubKey,
            timestamp: latest?.timestamp,
        }
    }

    public async getStreamHistory(): Promise<{
        streamId: string,
        timestamp: string,
    }[]> {
        const client = new DynamoDB.DocumentClient();
        const request: any = {
            TableName: Config.tableName,
            KeyConditionExpression: "CategoryKey = :ckey",
            ExpressionAttributeValues: {
                ":ckey": `DonoWatch_${this.broadcasterLogin.toLowerCase()}_streamhistory`
            }
        }
        const response = await client.query(request).promise();
        const sorted = response?.Items?.sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime())
            .filter(item => !!item.startDate);
        return sorted?.map(s => ({
            streamId: s?.SubKey,
            timestamp: s?.timestamp,
        })) ?? []
    }

    getKey(channel: string, streamId: string) {
        return `DonoWatch_${channel.toLowerCase()}_${streamId}`;
    }

    getSort(username: string) {
        return `${username.toLowerCase()}`;
    }
}