import { DynamoDB } from "aws-sdk";
import { stringify } from "querystring";
import { SetDonoRequest } from "../../twitch-dono";
import Config from "../Config";

export interface DonoData {
    SubKey: string
    dono: number;
    cheer: number
    data: any
    sub: number
    subgift: number
    value: number
    tier: number | undefined
}

export default class DonoDbClient {
    public static readonly CATEGORY = "DonoWatch";

    private broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin;
    }

    public async readLatestDonos(): Promise<{
        stream:{
            streamId: string,
            timestamp: string
        },
        donos: DonoData[]
    }> {
        const client = new DynamoDB.DocumentClient();

        // Get latest stream id
        const latestStream = await this.getLatestStream();
        const latestStreamId = latestStream.streamId;
        console.log({ latestStreamId });
        if (latestStreamId) {
            const request: any = {
                TableName: Config.tableName,
                KeyConditionExpression: "CategoryKey = :ckey",
                ExpressionAttributeValues: {
                    ":ckey": this.getKey(this.broadcasterLogin, latestStreamId)
                }
            }
            const response = await client.query(request).promise();
            console.log(response);
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
                UpdateExpression: "SET #dono = if_not_exists(#dono, :start) + :amount, #data = :data",
                ExpressionAttributeNames: { "#dono": "dono", "#data": "data" },
                ExpressionAttributeValues: {
                    ":amount": amount,
                    ":start": 0,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
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
                UpdateExpression: "SET #cheer = if_not_exists(#cheer, :start) + :bits, #data = :data",
                ExpressionAttributeNames: { "#cheer": "cheer", "#data": "data" },
                ExpressionAttributeValues: {
                    ":bits": parseInt(bits.toString()),
                    ":start": 0,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
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
                UpdateExpression: "SET #sub = :sub, #data = :data, #tier = :tier",
                ExpressionAttributeNames: { "#sub": "sub", "#data": "data", "#tier": "tier" },
                ExpressionAttributeValues: {
                    ":sub": 1,
                    ":tier": tier,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
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
                UpdateExpression: "SET #subgift = if_not_exists(#subgift, :start) + :subs, #data = :data, #tier = :tier",
                ExpressionAttributeNames: { "#subgift": "subgift", "#data": "data", "#tier": "tier" },
                ExpressionAttributeValues: {
                    ":start": 0,
                    ":subs": subs,
                    ":tier": tier,
                    ":data": {
                        username: username.toLowerCase(),
                        streamId: streamId.toLowerCase(),
                        channel: this.broadcasterLogin.toLowerCase(),
                    },
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

    getKey(channel: string, streamId: string) {
        return `DonoWatch_${channel.toLowerCase()}_${streamId}`;
    }

    getSort(username: string) {
        return `${username.toLowerCase()}`;
    }
}