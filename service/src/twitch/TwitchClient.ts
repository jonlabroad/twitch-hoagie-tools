import axios, { AxiosResponse } from "axios";
import Config from "../Config";
import { StreamData, UserData } from "./TwitchClientTypes";
import TwitchProvider from "./TwitchProvider";
import { TwitchSubscription } from "./TwitchSubscription";

const subscriptionCallbackHost = process.env.STAGE === "prod" ? "https://hoagietools-svc-prod.hoagieman.net" : "https://hoagietools-svc-development.hoagieman.net";

export interface ValidatedSession {
    expires_in: number
    login: string
    user_id: string
}

export interface UserFollows {
    from_id: string
    from_login: string
    from_name: string
    to_id: string
    to_name: string
    followed_at: string
}

export default class TwitchClient {
    private userIdCache: Record<string, Promise<any> | undefined> = {};

    authToken?: {
        access_token: string,
        expires_in: number,
        token_type: string
    }

    constructor() {
    }

    async getUserId(username: string): Promise<string | undefined> {
        const url = `https://api.twitch.tv/helix/users?login=${username}`;
        let request = this.userIdCache[username.toLowerCase()];
        if (!request) {
            console.log(url);
            request = (async () => {
                const authToken = await this.getAuthToken();
                return axios.get<any>(`https://api.twitch.tv/helix/users?login=${username}`, {
                    headers: {
                        "Client-ID": `${Config.twitchClientId}`,
                        Authorization: `Bearer ${authToken?.access_token}`
                    }
                });
            })();

            this.userIdCache[username.toLowerCase()] = request;
        }

        const response = await request;
        if (response.status === 200 && response.data?.data && response.data?.data?.length === 1) {
            return response.data.data[0].id;
        }
        return undefined;
    }

    public async listSubscriptions() {
        const authToken = await this.getAuthToken();
        const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
        const options = {
            headers: {
                "Client-ID": `${Config.twitchClientId}`,
                Authorization: `Bearer ${authToken?.access_token}`
            }
        };

        const response = await axios.get<any>(url, options);
        return response.data as {
            data: TwitchSubscription[],
            total: number,
            total_cost: number,
            max_total_cost: number,
            pagination: any
        };
    }

    public async createSubscription(type: string, condition: Record<string, string>) {
        const authToken = await this.getAuthToken();

        const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
        console.log({ url });
        const data = {
            type,
            version: "1",
            condition,
            transport: {
                method: "webhook",
                callback: `${subscriptionCallbackHost}/api/twitchcallback`,
                secret: Config.subscriptionSecret
            }
        };
        const config = {
            headers:
            {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
                "Content-Type": "application/json"
            }
        };
        const response = await axios.post(url, data, config);
        console.log("SUBSCRIPTIONS");
        return response.data;
    }

    async deleteSubscription(id: string): Promise<any> {
        const url = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
        const authToken = await this.getAuthToken();
        const response = await axios.delete(url, {
            headers: {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
            }
        });
        return response.data;
    }

    async getUserFollows(broadcasterId: string, userId: string): Promise<UserFollows[]> {
        const url = `https://api.twitch.tv/helix/users/follows?to_id=${broadcasterId}&from_id=${userId}`;
        const authToken = await this.getAuthToken();
        const data = await axios.get<{ data: UserFollows[] }>(url, {
            headers: {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
            }
        });
        return data.data.data;
    }

    async getBroadcasterIdLiveStream(userId: string): Promise<StreamData> {
        const url = `https://api.twitch.tv/helix/streams?user_id=${userId}&type=live`;
        console.log({ url });
        const authToken = await this.getAuthToken();

        const response = await axios.get<any>(url, {
            headers: {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
            }
        });
        console.log(JSON.stringify(response.data, null, 2));
        return response.data.data[0];
    }

    async getBroadcasterLoginLiveStream(userLogin: string): Promise<StreamData> {
        const url = `https://api.twitch.tv/helix/streams?user_login=${userLogin}&type=live`;
        console.log({ url });
        const authToken = await this.getAuthToken();

        const response = await axios.get<any>(url, {
            headers: {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
            }
        });
        console.log({ data: response.data })
        return response.data.data[0];
    }

    // Confirm that this Twitch user is who they say they are
    async validateUserAndToken(userNameOrId: string, userToken: string) {
        try {
            console.log("https://id.twitch.tv/oauth2/validate");
            const response = await axios.get<any>("https://id.twitch.tv/oauth2/validate", {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            return {
                validated: response.status === 200 && 
                    ((!!userNameOrId && userNameOrId === response.data.login) || (!!userNameOrId && userNameOrId === response.data.user_id)),
                validatedSession: response.data
            };
        } catch (err) {
            console.error(err.message, err);
            return {
                validated: false,
                validatedSession: null
            }
        }
    }

    async getUserData(userLogin: string): Promise<UserData> {
        const url = `https://api.twitch.tv/helix/users?login=${userLogin}`;
        const authToken = await this.getAuthToken();
        const response = await axios.get<{ data: UserData[] }>(url, {
            headers: {
                "Authorization": `Bearer ${authToken?.access_token}`,
                "Client-ID": Config.twitchClientId,
            }
        });
        console.log({response});
        return response.data.data[0];
    }

    async getAuthToken() {
        if (!this.authToken) {
            console.log(`https://id.twitch.tv/oauth2/token?client_id=${Config.twitchClientId}&client_secret=${Config.twitchClientSecret}&grant_type=client_credentials`);
            const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${Config.twitchClientId}&client_secret=${Config.twitchClientSecret}&grant_type=client_credentials`);
            if (response.status === 200 && response.data) {
                this.authToken = response.data;
            }
        }
        return this.authToken;
    }

    isAdmin(userId: string) {
        return Config.AdminUserIds.includes(userId);
    }
}