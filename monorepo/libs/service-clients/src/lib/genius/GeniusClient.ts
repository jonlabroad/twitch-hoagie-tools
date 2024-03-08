import axios from 'axios';
import qs from 'qs';
import { decode } from 'html-entities';
// Probably do this a better way. The browser can't import this, but the ui doesn't actually use it... so...
let JSSoup: any;
if (typeof require !== 'undefined') {
  JSSoup = require('jssoup')?.default;
}

export interface GeniusSearchResponse {
  response: {
    hits: {
      type: string;
      result: {
        full_title: string;
        artist_names: string;
        id: string;
        lyrics_state: string;
        path: string;
        title: string;
        url: string;
        primary_artist: {
          id: number;
          name: string;
          url: string;
        };
      };
    }[];
  };
}

export class GeniusClient {
  private accessToken;

  private static baseUrl = 'https://api.genius.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async getAccessToken() {
    return Promise.resolve(this.accessToken);
  }

  public async getSong(query: string) {
    console.log(`Searching Genius lyrics for ${query}`);
    const accessToken = await this.getAccessToken();

    const queryString = qs.stringify({
      q: query,
    });
    const request = `${GeniusClient.baseUrl}/search?${queryString}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await axios.get<GeniusSearchResponse>(request, {
      headers,
    });
    console.log({ topGeniusHits: response.data.response.hits.slice(0, 10) });
    const result = response.data.response.hits[0]?.result;
    return result;
  }

  public async getLyricsFromUrl(url: string) {
    const pageResponse = await axios.get(url);
    const soup = new JSSoup(pageResponse.data);
    const lyricsElements = soup.findAll('div', {
      'data-lyrics-container': 'true',
    });
    const lyrics = decode(
      lyricsElements.map((el: any) => el.getText('\n') ?? '').join('\n')
    );
    return lyrics;
  }
}
