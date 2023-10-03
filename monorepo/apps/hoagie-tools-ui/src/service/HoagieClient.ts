import axios from "axios";
import { RaidEvent } from "../components/raid/RaidEvent";

export interface DonoData {
    SubKey: string
    dono: number
    cheer: number
    hypechat: number
    data: any
    sub: number
    subgift: number
    value: number
    username: string
}

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

export type UserDonoSummaries = Record<string, UserDonoSummary>;

export interface UserDonoSummary {
    username: string;
    value: number;
    subs: number;
    subtier: string;
    subgifts: number;
    bits: number;
    dono: number;
    hypechat: number;
  }

export interface AdminData {
    CategoryKey: string
    SubKey: string

    chatUsername: string
    chatToken: string
    streamers: string[]
}

export default class HoagieClient {
    //readonly BASE_URL = process.env.NODE_ENV === "production" ? 'https://hoagietools-svc-prod.hoagieman.net/api/' : 'https://hoagietools-svc-development.hoagieman.net/api/';
    readonly BASE_URL = 'https://hoagietools-svc-prod.hoagieman.net/api/';

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
        const response = await axios.get(`${this.BASE_URL}listsubscriptions`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async createSubscriptions(username: string, channelName: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}createsubscriptions?streamername=${channelName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async deleteSubscription(id: string, username: string, accessToken: string) {
        const response = await axios.post(`${this.BASE_URL}deletesubscription?id=${id}`, {}, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async setSSLToken(sslToken: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.post(`${this.BASE_URL}streamersonglist/settoken?streamerLogin=${streamerName}`, {
            username: streamerName,
            streamerSongListToken: sslToken,
        }, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async getSSLStatus(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}streamersonglist/status?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async refreshBotToken(username: string, accessToken: string, streamerName: string) {
        const response = await axios.post(`${this.BASE_URL}bot/refreshtoken?streamername=${streamerName}`, {
            username: streamerName,
        }, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async getBotToken(username: string, accessToken: string, streamerName: string): Promise<{
        botToken: string
    }> {
        const response = await axios.get(`${this.BASE_URL}bot/gettoken?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async writeSpotifyToken(twitchUsername: string, accessToken: string, spotifyToken: string, redirectUri: string) {
        const url = `${this.BASE_URL}spotify/settoken`;
        const response = await axios.post(url, {
            token: spotifyToken,
            redirectUri,
        }, {
            headers: this.getHeaders(twitchUsername, accessToken)
        })
        return response.data;
    }

    async createSpotifyPlaylist(requestorUsername: string, streamerName: string, accessToken: string) {
        const url = `${this.BASE_URL}spotify/createplaylist`;
        const response = await axios.post(url, {
            streamerName: streamerName
        }, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getSpotifySongs(requestorUsername: string, songs: ({ songKey: string, artist: string, title: string } | undefined)[], accessToken: string, streamerName: string) {
        const url = `${this.BASE_URL}spotify/getsongs?streamername`;
        const response = await axios.post(url, { songs }, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getSpotifySong(requestorUsername: string, artist: string, title: string, accessToken: string, streamerName: string) {
        const url = `${this.BASE_URL}spotify/getsong?artist=${artist}&title=${title}&streamername=${streamerName}`;
        const response = await axios.get(url, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getRaids(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}raiddata?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            raids: RaidEvent[];
        }
    }

    async getDonos(username: string, accessToken: string, streamerName: string, streamIds?: string[]) {
        const response = await axios.get(`${this.BASE_URL}donodata?streamername=${streamerName}${streamIds ? streamIds.map(streamId => `&streamId=${streamId}`).join('') : ''}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            stream: {
                streamId: string
                timestamp: string
            },
            donos: DonoData[]
        }
    }

    async getDonosV2(username: string, accessToken: string, streamerName: string, streamIds?: string[]): Promise<{data: UserDonoSummaries}> {
        const response = await axios.get(`${this.BASE_URL}v2/donodata?streamername=${streamerName}${streamIds ? streamIds.map(streamId => `&streamId=${streamId}`).join('') : ''}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as { data: UserDonoSummaries };
    }

    async getStreamHistory(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}streamhistory?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            streamId: string,
            timestamp: string,
        }[]
    }

    async getStreamHistoryV2(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}v2/streamhistory?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        console.log({ history: response.data });
        return response.data as {
            streams: {
                id: string
                started_at: string
            }[],
        }
    }

    async getAdminConfig(username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}admin/config`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as AdminData | undefined;
    }

    async adminSetStreamers(streamers: string[], username: string, accessToken: string) {
        await axios.post(`${this.BASE_URL}admin/setstreamers`, {
            streamers
        }, {
            headers: this.getHeaders(username, accessToken)
        });
    }

    async adminSetConfig(config: AdminData, username: string, accessToken: string) {
        await axios.post(`${this.BASE_URL}admin/setconfig`, {
            config
        }, {
            headers: this.getHeaders(username, accessToken)
        });
    }

    async songEval(song: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}songeval/eval?query=${song}&streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async addWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.BASE_URL}songeval/whitelistwords?streamername=${streamerName}&word=${word}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async removeWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.BASE_URL}songeval/whitelistwords?streamername=${streamerName}&word=${word}&remove=true`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async readSongEvalConfig(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}songeval/config?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async getMods(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}mods?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async addMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const response = await axios.put(`${this.BASE_URL}addmod?username=${modName}&streamername=${streamerName}`, {}, {
            headers: this.getHeaders(username, accessToken),
        });
        return response?.data;
    }

    async removeMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const response = await axios.put(`${this.BASE_URL}removemod?username=${modName}&streamername=${streamerName}`, {}, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async getSystemStatus(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}admin/system/status?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    getHeaders(username: string, accessToken: string) {
        const token = btoa(`${username}:${accessToken}`)
        return  {
            "Authorization": `Basic ${token}`
        }
    }
}