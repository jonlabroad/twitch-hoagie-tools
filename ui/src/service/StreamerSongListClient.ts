import axios from "axios";

export interface GetStreamerResponse {
    id: number
    userId: number
    name: string
}

export interface SongListSong {
        id: number
        note: string
        botRequestBy: string
        nonlistSong: string
        donationAmount: number
        createdAt: string
        songId: number
        streamerId: number
        position: number
        song: {
            artist: string
            attributeIds: any[]
            createdAt: string
            id: number
            title: string
        }
}

export interface GetQueueResponse {
    list: SongListSong[],
    status: {
        string: number
    },
}

export default class StreamerSongListClient {
    private static baseUrl = "https://api.streamersonglist.com";

    public async getTwitchStreamer(username: string): Promise<GetStreamerResponse> {
        const response = await axios.get(`${StreamerSongListClient.baseUrl}/v1/streamers/${username}?platform=twitch`);
        return response.data;
    }

    public async getQueue(streamerId: number): Promise<GetQueueResponse> {
        const response = await axios.get(`${StreamerSongListClient.baseUrl}/v1/streamers/${streamerId}/queue`);
        return response.data;
    }
}
