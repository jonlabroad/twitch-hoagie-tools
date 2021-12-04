import axios from "axios";

export interface FollowResponse {
    userLogin: string
    streamerLogin: string
    follows: boolean
}

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

    async getFollow(streamerLogin: string, userLogin: string): Promise<FollowResponse> {
        const response = await axios.get<FollowResponse>(`${this.BASE_URL}getuserfollows?streamerName=${streamerLogin}&userName=${userLogin}`);
        return response.data;
    }
}
