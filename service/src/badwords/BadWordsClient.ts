import axios from "axios";
import NodeCache from "node-cache";
import qs from "qs";

const cache = new NodeCache();

export default class BadWordsClient {
    private clientSecret;

    private static baseUrl = "https://api.apilayer.com/bad_words";

    constructor(clientSecret: string) {
        this.clientSecret = clientSecret;
    }

    public async eval(fullTitle: string, text: string) {

        let result = cache.get(fullTitle.toLowerCase());
        if (result) {
            return result;
        }

        const queryString = qs.stringify({
            censor_character: "*"
        });
        const request = `${BadWordsClient.baseUrl}${queryString ? `?${queryString}` : ''}`;
        const headers = {
            apiKey: `${this.clientSecret}`
        }
        let response: any = undefined;
        try {
            const data = text.replace(/\n/g, ' ').replace(/\(/g, '').replace(/\)/g, '');
            response = await axios.post(request, data, {
                headers
            });
        } catch (err) {
            console.error(err);
        }
        result = response?.data;
        if (result) {
            cache.set(fullTitle.toLowerCase(), result, 600);
        }
        return result;
    }
}