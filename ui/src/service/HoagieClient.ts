import axios from "axios";

export default class HoagieClient {
    readonly BASE_URL = 'https://hoagietools-svc.hoagieman.net/api/';

    async analyze(text: string): Promise<Record<string, number> | undefined> {
        console.log({text});
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
