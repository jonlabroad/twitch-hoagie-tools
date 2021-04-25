import axios, { AxiosResponse } from "axios";
import NodeCache from "node-cache";
import { clientId } from "../components/MainPage";
import CacheManager from "../util/CacheManager";
import { ChannelData, UserData, UsersFollows } from "./TwitchClientTypes";

export interface ValidatedSession {
    expires_in: number
    login: string
    user_id: string
}

export default class TwitchClient {
    accessToken: string;
    cache: NodeCache;

    constructor(accessToken: string, cacheManager?: CacheManager) {
        this.accessToken = accessToken;
        this.cache = cacheManager?.get("TwitchClient") ?? new NodeCache();
    }

    async validateSession(): Promise<{
        validatedSession: ValidatedSession | undefined,
        validated: boolean
    }> {
        const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
            headers: {
                Authorization: `OAuth ${this.accessToken}`
            }
        });
        return {
            validated: response.status === 200,
            validatedSession: response.data
        };
    }

    async getUsers(usernames: string[]): Promise<UserData[]> {
        const data = await this.getRequest(`https://api.twitch.tv/helix/users?${usernames.map(username => `login=${username}&`)}`);
        return data.data;
    }

    async getUserStream(username: string): Promise<any[]> {
        return await this.getRequest(`https://api.twitch.tv/helix/streams?user_login=${username}`);
    }

    async getChannel(broadcasterId: string): Promise<ChannelData[]> {
        const data = await this.getRequest(`https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`);
        return data.data;
    }

    async getChannelByUser(username: string): Promise<ChannelData | undefined> {
        const userData = await this.getUsers([username]);
        if (userData && userData.length > 0) {
            const broadcasterId = userData[0].id;
            const channelData = await this.getChannel(broadcasterId);
            if (channelData && channelData.length > 0) {
                return channelData[0];
            }
        }
        return undefined;
    }

    async getFollows(props: { toId?: string, fromId?: string, max?: number, cursor?: string }): Promise<UsersFollows> {
        const { toId, fromId, max, cursor } = props;
        let query = [];
        query.push(toId ? `to_id=${toId}` : '');
        query.push(fromId ? `from_id=${fromId}` : '');
        query.push(max ? `first=${max}` : '');
        query.push(cursor ? `after=${cursor}` : '');
        const request = `https://api.twitch.tv/helix/users/follows?${query.join("&")}`;
        const data = await this.getRequest(request);
        return data;
    }

    async getRequest(request: string) {
        const cached = this.cache.get(request) as AxiosResponse;
        if (cached) {
            return cached;
        }

        const response = await axios.get(request, {
            headers: {
                "client-id": clientId,
                Authorization: `Bearer ${this.accessToken}`
            }
        });
        
        if (response && response.status === 200) {
            this.cache.set(request, response.data);
        }

        return response.data;
    }
}