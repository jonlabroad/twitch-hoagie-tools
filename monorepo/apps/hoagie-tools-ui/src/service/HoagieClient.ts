import axios from "axios";
import { RaidEvent } from "../components/raid/RaidEvent";
import { DonoDataResponse } from "@hoagie/dono-service"

export interface AdminData {
    CategoryKey: string
    SubKey: string

    chatUsername: string
    chatToken: string
    streamers: string[]
}

export default class HoagieClient {
    //readonly BASE_URL = process.env.NODE_ENV === "production" ? 'https://hoagietools-svc-prod.hoagieman.net/api/' : 'https://hoagietools-svc-development.hoagieman.net/api/';
    readonly LEGACY_BASE_URL = 'https://hoagietools-svc-prod.hoagieman.net/api/';
    readonly DONO_BASE_URL = 'https://dono.hoagieman.net/api/v2/';

    async analyze(text: string): Promise<Record<string, number> | undefined> {
        let result = undefined;
        try {
            const response = await axios.get(`${this.LEGACY_BASE_URL}chateval?msg=${encodeURIComponent(text)}`);
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
        const response = await axios.get(`${this.LEGACY_BASE_URL}listsubscriptions`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async createSubscriptions(username: string, channelName: string, accessToken: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}createsubscriptions?streamername=${channelName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async deleteSubscription(id: string, username: string, accessToken: string) {
        const response = await axios.post(`${this.LEGACY_BASE_URL}deletesubscription?id=${id}`, {}, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async setSSLToken(sslToken: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.post(`${this.LEGACY_BASE_URL}streamersonglist/settoken?streamerLogin=${streamerName}`, {
            username: streamerName,
            streamerSongListToken: sslToken,
        }, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async getSSLStatus(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}streamersonglist/status?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async refreshBotToken(username: string, accessToken: string, streamerName: string) {
        const response = await axios.post(`${this.LEGACY_BASE_URL}bot/refreshtoken?streamername=${streamerName}`, {
            username: streamerName,
        }, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async getBotToken(username: string, accessToken: string, streamerName: string): Promise<{
        botToken: string
    }> {
        const response = await axios.get(`${this.LEGACY_BASE_URL}bot/gettoken?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async writeSpotifyToken(twitchUsername: string, accessToken: string, spotifyToken: string, redirectUri: string) {
        const url = `${this.LEGACY_BASE_URL}spotify/settoken`;
        const response = await axios.post(url, {
            token: spotifyToken,
            redirectUri,
        }, {
            headers: this.getHeaders(twitchUsername, accessToken)
        })
        return response.data;
    }

    async createSpotifyPlaylist(requestorUsername: string, streamerName: string, accessToken: string) {
        const url = `${this.LEGACY_BASE_URL}spotify/createplaylist`;
        const response = await axios.post(url, {
            streamerName: streamerName
        }, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getSpotifySongs(requestorUsername: string, songs: ({ songKey: string, artist: string, title: string } | undefined)[], accessToken: string, streamerName: string) {
        const url = `${this.LEGACY_BASE_URL}spotify/getsongs?streamername`;
        const response = await axios.post(url, { songs }, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getSpotifySong(requestorUsername: string, artist: string, title: string, accessToken: string, streamerName: string) {
        const url = `${this.LEGACY_BASE_URL}spotify/getsong?artist=${artist}&title=${title}&streamername=${streamerName}`;
        const response = await axios.get(url, {
            headers: this.getHeaders(requestorUsername, accessToken)
        })
        return response.data;
    }

    async getRaids(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}raiddata?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            raids: RaidEvent[];
        }
    }

    async getDonosV2(username: string, accessToken: string, streamerName: string, streamIds?: string[]): Promise<DonoDataResponse> {
        const response = await axios.get(`${this.DONO_BASE_URL}dono?streamerLogin=${streamerName}${streamIds ? streamIds.map(streamId => `&streamId=${streamId}`).join('') : ''}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as DonoDataResponse;
    }

    async getStreamHistory(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}streamhistory?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            streamId: string,
            timestamp: string,
        }[]
    }

    async getStreamHistoryV2(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}v2/streamhistory?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as {
            streams: {
                id: string
                started_at: string
            }[],
        }
    }

    async getAdminConfig(username: string, accessToken: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}admin/config`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data as AdminData | undefined;
    }

    async adminSetStreamers(streamers: string[], username: string, accessToken: string) {
        await axios.post(`${this.LEGACY_BASE_URL}admin/setstreamers`, {
            streamers
        }, {
            headers: this.getHeaders(username, accessToken)
        });
    }

    async adminSetConfig(config: AdminData, username: string, accessToken: string) {
        await axios.post(`${this.LEGACY_BASE_URL}admin/setconfig`, {
            config
        }, {
            headers: this.getHeaders(username, accessToken)
        });
    }

    async songEval(song: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}songeval/eval?query=${song}&streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async addWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}songeval/whitelistwords?streamername=${streamerName}&word=${word}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async removeWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}songeval/whitelistwords?streamername=${streamerName}&word=${word}&remove=true`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async readSongEvalConfig(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}songeval/config?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async getMods(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}mods?streamername=${streamerName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async addMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}addmod?username=${modName}&streamername=${streamerName}`, {}, {
            headers: this.getHeaders(username, accessToken),
        });
        return response?.data;
    }

    async removeMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}removemod?username=${modName}&streamername=${streamerName}`, {}, {
            headers: this.getHeaders(username, accessToken)
        });
        return response?.data;
    }

    async getSystemStatus(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}admin/system/status?streamername=${streamerName}`, {
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
