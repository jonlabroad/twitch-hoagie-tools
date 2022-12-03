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

    async getSpotifySongs(requestorUsername: string, songs: ({ songKey: string, artist: string, title: string } | undefined)[], accessToken: string) {
        const url = `${this.BASE_URL}spotify/getsongs?username=${requestorUsername}`;
        const response = await axios.post(url, { songs }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        return response.data;
    }

    async getSpotifySong(requestorUsername: string, artist: string, title: string, accessToken: string) {
        const url = `${this.BASE_URL}spotify/getsong?username=${requestorUsername}&artist=${artist}&title=${title}`;
        const response = await axios.get(url, {
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
        return response.data as {
            raids: RaidEvent[];
        }
    }

    async getDonos(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}donodata?username=${username}&streamername=${streamerName}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data as {
            streamId: string
            donos: DonoData[]
        }
    }

    async getAdminConfig(username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}admin/config?username=${username}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data as AdminData | undefined;
    }

    async adminSetStreamers(streamers: string[], username: string, accessToken: string) {
        await axios.post(`${this.BASE_URL}admin/setstreamers?username=${username}`, {
            streamers
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
    }

    async adminSetConfig(config: AdminData, username: string, accessToken: string) {
        await axios.post(`${this.BASE_URL}admin/setconfig?username=${username}`, {
            config
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
    }

    async songEval(song: string, username: string, accessToken: string) {
        const response = await axios.get(`${this.BASE_URL}songeval/eval?username=${username}&query=${song}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response?.data;
    }

    async addWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.BASE_URL}songeval/whitelistwords?username=${username}&streamername=${streamerName}&word=${word}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response?.data;
    }

    async removeWhitelistWord(word: string, username: string, accessToken: string, streamerName: string) {
        const response = await axios.put(`${this.BASE_URL}songeval/whitelistwords?username=${username}&streamername=${streamerName}&word=${word}&remove=true`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response?.data;
    }

    async readSongEvalConfig(username: string, accessToken: string, streamerName: string) {
        const response = await axios.get(`${this.BASE_URL}songeval/config?username=${username}&streamername=${streamerName}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response?.data;
    }
}
