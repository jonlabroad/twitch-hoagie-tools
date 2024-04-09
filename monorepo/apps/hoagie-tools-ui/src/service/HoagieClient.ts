import axios from "axios";
import { RaidEvent } from "../components/raid/RaidEvent";

export interface AdminData {
    CategoryKey: string
    SubKey: string

    chatUsername: string
    chatToken: string
    streamers: string[]
}

export default class HoagieClient {
    readonly LEGACY_BASE_URL = (() => {
        const urlParams = new URLSearchParams(window.location.search);
        return !!urlParams.get("dev") ? 'https://hoagietools-svc-development.hoagieman.net/api/' : 'https://hoagietools-svc-prod.hoagieman.net/api/';
    })();

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

    async listSubscriptions(userId: string, streamerId: string, accessToken: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}listsubscriptions?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response.data;
    }

    async createSubscriptions(userId: string, streamerId: string, accessToken: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}createsubscriptions?streamerid=${streamerId}`, {
          headers: this.getHeaders(userId, accessToken)
        });
        return response.data;
    }

    async createSelfSubscriptions(username: string, channelName: string, accessToken: string) {
      const response = await axios.get(`${this.LEGACY_BASE_URL}createselfsubscriptions?streamername=${channelName}`, {
            headers: this.getHeaders(username, accessToken)
        });
        return response.data;
    }

    async deleteSubscription(id: string, userId: string, accessToken: string) {
        const response = await axios.post(`${this.LEGACY_BASE_URL}deletesubscription?id=${id}`, {}, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response.data;
    }

    async setSSLToken(sslToken: string, userId: string, accessToken: string, streamerId: string) {
        const response = await axios.post(`${this.LEGACY_BASE_URL}streamersonglist/settoken?streamerid=${streamerId}`, {
            username: userId,
            streamerSongListToken: sslToken,
        }, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response.data;
    }

    async getSSLStatus(userId: string, accessToken: string, streamerId: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}streamersonglist/status?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
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

    async getSpotifySongLegacy(requestorUsername: string, artist: string, title: string, accessToken: string, streamerName: string) {
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

    async getStreamHistoryV2(userId: string, accessToken: string, streamerId: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}v2/streamhistory?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response.data as {
            streams: {
                id: string
                started_at: string
            }[],
        }
    }

    async getAdminConfig(userId: string, accessToken: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}admin/config`, {
            headers: this.getHeaders(userId, accessToken)
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
      const response = await axios.get(`https://songeval.hoagieman.net/api/v1/eval?query=${song}&streamername=${streamerName}`,
      {
          headers: this.getHeaders(username, accessToken)
      });
      return response?.data;
  }

    async addWhitelistWord(word: string, userId: string, accessToken: string, streamerId: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}songeval/whitelistwords?streamerid=${streamerId}&word=${word}`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response?.data;
    }

    async removeWhitelistWord(word: string, userId: string, accessToken: string, streamerId: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}songeval/whitelistwords?streamerid=${streamerId}&word=${word}&remove=true`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response?.data;
    }

    async readSongEvalConfig(userId: string, accessToken: string, streamerId: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}songeval/config?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response?.data;
    }

    async getMods(userId: string, accessToken: string, streamerId: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}mods?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response?.data;
    }

    async addMod(userId: string, accessToken: string, streamerId: string, modId: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}addmod?userid=${modId}&streamerid=${streamerId}`, {}, {
            headers: this.getHeaders(userId, accessToken),
        });
        return response?.data;
    }

    async removeMod(userId: string, accessToken: string, streamerId: string, modId: string) {
        const response = await axios.put(`${this.LEGACY_BASE_URL}removemod?userid=${modId}&streamerid=${streamerId}`, {}, {
            headers: this.getHeaders(userId, accessToken)
        });
        return response?.data;
    }

    async getSystemStatus(userId: string, accessToken: string, streamerId: string) {
        const response = await axios.get(`${this.LEGACY_BASE_URL}admin/system/status?streamerid=${streamerId}`, {
            headers: this.getHeaders(userId, accessToken)
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
