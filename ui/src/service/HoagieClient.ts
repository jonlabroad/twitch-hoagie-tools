import axios from "axios";

export default class HoagieClient {
    readonly BASE_URL = 'https://hoagietools.thejonlab.net/api/';

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
}
