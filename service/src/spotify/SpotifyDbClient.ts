import { DynamoDB } from "aws-sdk";
import { PutItemInput } from "aws-sdk/clients/dynamodb";
import Config from "../Config";

import TwitchClient from "../twitch/TwitchClient";

export default class SpotifyDbClient {
    public static readonly SECRETS_CATEGORY = "SECRETS";
    public static readonly STREAMER_SONGLIST_SUBCAT = "spotifyToken";

    public static readonly SPOTIFY_CATEGORY = "SPOTIFY";
    public static readonly PLAYLIST_SUBCAT = "playlist";

    public static async setToken(username: string, token: string) {
        const client = new DynamoDB.DocumentClient();

        const userId = await (new TwitchClient()).getUserId(username) ?? "ERROR";

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${userId.toString()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
                Value: {
                    username: username,
                    token
                }
            }
        };
        const response = await client.put(request).promise();
        console.log(response);
    }

    public static async getToken(streamerName: string) {
        const client = new DynamoDB.DocumentClient();
        const userId = await (new TwitchClient()).getUserId(streamerName) ?? "ERROR";

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${userId.toString()}_${this.SECRETS_CATEGORY}`,
                SubKey: this.STREAMER_SONGLIST_SUBCAT,
            }
        }
        const response = await client.get(request).promise();
        return response?.Item?.Value?.token;
    }

    public static async setPlaylist(streamerName: string, playlistId: string) {
        const client = new DynamoDB.DocumentClient();

        const streamerId = await (new TwitchClient()).getUserId(streamerName) ?? "ERROR";

        const request: any = {
            TableName: Config.tableName,
            Item: {
                CategoryKey: `${streamerId.toString()}_${this.SPOTIFY_CATEGORY}`,
                SubKey: this.PLAYLIST_SUBCAT,
                Value: {
                    playlistId
                }
            }
        };
        const response = await client.put(request).promise();
        console.log(response);
    }

    public static async getPlaylist(streamerName: string) {
        const client = new DynamoDB.DocumentClient();
        const userId = await (new TwitchClient()).getUserId(streamerName) ?? "ERROR";

        const request: any = {
            TableName: Config.tableName,
            Key: {
                CategoryKey: `${userId.toString()}_${this.SPOTIFY_CATEGORY}`,
                SubKey: this.PLAYLIST_SUBCAT,
            }
        }
        const response = await client.get(request).promise();
        return response?.Item?.Value?.playlistId;
    }
}