import axios, { AxiosResponse } from "axios";

interface GetStreamerResponse {
    id: number
}

export default class StreamerSongListClient {
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
    }

    public async isAdmin(username: string) {
        const id = await this.getStreamerId(username);

        const url = `https://api.streamersonglist.com/v1/streamers/${id}/songs/song-validation?title=test&artist=test`;
        console.log(url);
        let response: AxiosResponse<any> | undefined = undefined;
        try {
            response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
        } catch (err) {
            console.log(err.message);
        }
        return response?.status === 200;
    }

    public async getStreamerId(username: string) {
        const url = `https://api.streamersonglist.com/v1/streamers/${username}?platform=twitch`;
        const response = await axios.get<GetStreamerResponse>(url);
        return response.data.id;
    }
}