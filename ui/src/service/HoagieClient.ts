import axios from "axios";
import { RaidEvent } from "../components/raid/RaidEvent";

export default class HoagieClient {
    readonly BASE_URL = process.env.NODE_ENV === "production" ? 'https://hoagietools-svc-prod.hoagieman.net/api/' : 'https://hoagietools-svc-development.hoagieman.net/api/';

    async analyze(text: string): Promise<Record<string, number> | undefined> {
        let result = undefined;
        try {
            const response = await axios.get(`${this.BASE_URL}chateval?msg=${encodeURIComponent(text)}`);
            if (response && response.data) {
                const data = response.data;
                result = data.evaluation;
            }
        } catch (err) {
            console.error(err);
        }
        return result;
    }

    async listSubscriptions(username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}listsubscriptions?username=${username}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async createSubscriptions(username: string, channelName: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}createsubscriptions?username=${username}&channelname=${channelName}`, {
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

    async setSSLToken(sslToken: string, username: string, accessToken: string) {
        const response = await axios.post(`${this.BASE_URL}streamersonglist/settoken?username=${username}`, {
            username,
            streamerSongListToken: sslToken,
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async getSSLStatus(username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}streamersonglist/status?username=${username}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    async writeSpotifyToken(twitchUsername: string, accessToken: string, spotifyToken: string, redirectUri: string) {
        const url = `${this.BASE_URL}spotify/settoken?username=${twitchUsername}`;
        const response = await axios.post(url, {
            token: spotifyToken,
            redirectUri,
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        return response.data;
    }

    async createSpotifyPlaylist(requestorUsername: string, streamerName: string, accessToken: string) {
        const url = `${this.BASE_URL}spotify/createplaylist?username=${requestorUsername}`;
        const response = await axios.post(url, {
            streamerName: streamerName
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        return response.data;
    }

    async getRaids(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}raiddata?username=${username}&streamerLogin=${streamerName}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        console.log({datadata: response.data});
        return response.data as {
            raids: RaidEvent[];
        }
    }
}
