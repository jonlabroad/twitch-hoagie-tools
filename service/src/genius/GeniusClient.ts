import axios from "axios";
import qs from "qs";
import { decode } from "html-entities";
import fs from "fs";
const JSSoup = require('jssoup').default;
const phantom = require("x-ray-phantom");

const accessToken = "4iwQ4dRz9fRO_Px79MBdGzWKNxStt3jaadzq0CVrnTirLnYzL1NuQazTsAJmc0Ct"; //NOCOMMIT

export interface GeniusSearchResponse {
    response: {
        hits: {
            type: string
            result: {
                full_title: string
                artist_names: string
                id: string
                lyrics_state: string
                path: string
                title: string
                url: string
                primary_artist: {
                    id: number
                    name: string
                    url: string
                }
            }
        }[]
    }
}

export default class GeniusClient {
    private clientId;
    private clientSecret;

    private static baseUrl = "https://api.genius.com";

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public async getAccessToken() {
        return Promise.resolve(accessToken);
    }

    public async getSong(query: string) {
        const accessToken = await this.getAccessToken();

        const queryString = qs.stringify({
            q: query
        });
        const request = `${GeniusClient.baseUrl}/search?${queryString}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`
        }
        console.log(request);
        const response = await axios.get<GeniusSearchResponse>(request, {
            headers
        });
        console.log(response.data);
        const result = response.data.response.hits[0]?.result;
        return result;
    }

    public async getLyricsFromUrl(url: string) {
        const pageResponse = await axios.get(url);
        const soup = new JSSoup(pageResponse.data);
        const lyricsElements = soup.findAll('div', {"data-lyrics-container":"true"});
        const lyrics = decode(lyricsElements.map(el => el.getText("\n") ?? "").join("\n"));
        //fs.writeFileSync("test.txt", lyrics);
        return lyrics;
    }
}