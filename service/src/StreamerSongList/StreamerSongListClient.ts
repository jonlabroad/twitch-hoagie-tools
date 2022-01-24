import axios, { AxiosResponse } from "axios";

interface GetStreamerResponse {
    id: number
}

interface GetSongsResponse {
    items: StreamerSongListSong[]
    total: number
}

export interface StreamerSongListSong {
    title: string
    artist: string
    lastPlayed: string
    timesPlayed: number
}

export default class StreamerSongListClient {
    private readonly token: string;

    constructor(token?: string) {
        this.token = token ?? "";
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
        const url = `https://api.streamersonglist.com/v1/streamers/${username.toLowerCase()}?platform=twitch`;
        console.log(url);
        const response = await axios.get<GetStreamerResponse>(url);
        return response.data.id;
    }

    public async getSongListSongs(username: string) {
        const streamerId = await this.getStreamerId(username);
        let current = 0;
        const allSongs: StreamerSongListSong[] = [];
        let songs: StreamerSongListSong[] = [];
        do {
            const url = `https://api.streamersonglist.com/v1/streamers/${streamerId}/songs?size=100&current=${current}`;
            console.log(url);
            const response = await axios.get<GetSongsResponse>(url);
            songs = response.data.items;
            allSongs.push(...songs);
            current++;
        } while (songs.length > 0);
        return allSongs;
    }
}