import axios, { AxiosResponse } from "axios";
import Config from "../Config";
import { TwitchSubscription } from "./TwitchSubscription";

const subscriptionCallbackHost = process.env.STAGE === "prod" ? "https://hoagietools-svc-prod.hoagieman.net" : "https://hoagietools-svc-development.hoagieman.net";

export interface ValidatedSession {
    expires_in: number
    login: string
    user_id: string
}

export default class TwitchClient {
    private userIdCache: Promise<any> | undefined;

    authToken?: {
        access_token: string,
        expires_in: number,
        token_type: string
    }

    constructor() {
    }

    async getUserId(username: string): Promise<string | undefined> {
        const url = `https://api.twitch.tv/helix/users?login=${username}`;
        let request = this.userIdCache;
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
            
            this.userIdCache = request;
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
        const response = await axios.get<any>(url, {
            headers: {
                "Client-ID": `${Config.twitchClientId}`,
                Authorization: `Bearer ${authToken?.access_token}`
            }
        });
        return response.data as {
            data: TwitchSubscription[],
            total: number,
            total_cost: number,
            max_total_cost: number,
            pagination: any
        };
    }

    public async createSubscription(username: string, type: string, condition: Record<string, string>) {
        const client = new TwitchClient();
        console.log(`Getting userId for ${username}`)
        const userId = await client.getUserId(username);
        console.log({userId});
        if (!userId) {
            return;
        }

        const authToken = await this.getAuthToken();

        const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
        console.log({url});
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

    // Confirm that this Twitch user is who they say they are
    async validateUserIdAndToken(userName: string, userToken: string) {
        try {
            console.log("https://id.twitch.tv/oauth2/validate");
            const response = await axios.get<any>("https://id.twitch.tv/oauth2/validate", {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            return {
                validated: response.status === 200 && userName === response.data.login,
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

    isAdmin(userName: string) {
        return Config.AdminUserNames.includes(userName);
    }
}