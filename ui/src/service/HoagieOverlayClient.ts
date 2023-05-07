import axios from "axios";
import { RaidEvent } from "../components/raid/RaidEvent";

export interface DonoData {
    SubKey: string
    dono: number
    cheer: number
    data: any
    sub: number
    subgift: number
    value: number
}

export interface AdminData {
    CategoryKey: string
    SubKey: string

    chatUsername: string
    chatToken: string
    streamers: string[]
}

export default class HoagieClient {
    readonly BASE_URL = 'https://hoagie-unity-overlay-prod.hoagieman.net/api/';

    async listSubscriptions(username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}listsubscriptions?username=${username}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async createSubscriptions(username: string, channelName: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}createsubscriptions?username=${username}&streamername=${channelName}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async deleteSubscription(id: string, username: string, accessToken: string) {
        const response = await axios.post(`${this.BASE_URL}deletesubscription?username=${username}&id=${id}`, {}, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }
}
