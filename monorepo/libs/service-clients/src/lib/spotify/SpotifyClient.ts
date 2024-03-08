import axios from 'axios';
import { URLSearchParams } from 'url';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SearchResponse {
  tracks: {
    href: string;
    items: SpotifySong[];
  };
}

export interface AudioAnalysisResponse {
  track: {
    loudness: number;
    tempo: number;
    tempo_confience: number;
    time_signature: number;
    time_signature_confidence: number;
    key: number;
    key_confidence: number;
  };
}

export interface SpotifySong {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  href: string;
  name: string;
  uri: string;
  popularity: number;
  id: string;
}

export interface SpotifyAlbum {
  name: string;
  uri: string;
}

export interface SpotifyArtist {
  name: string;
  uri: string;
  href: string;
}

export class SpotifyClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private token: TokenResponse | undefined;

  public constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async getToken() {
    if (this.token) {
      return this.token;
    }

    const params = {
      grant_type: 'client_credentials',
    };

    const url = 'https://accounts.spotify.com/api/token';
    const response = await axios.post<TokenResponse>(url, params as any, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`
        ).toString('base64')}`,
      },
    });
    const tokenData = response.data;
    return tokenData;
  }

  public async refreshToken(refreshToken: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    const url = 'https://accounts.spotify.com/api/token';
    console.log(url);
    console.log(params);
    try {
      const response = await axios.post<TokenResponse>(url, params as any, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString('base64')}`,
        },
      });
      const tokenData = response.data;
      return tokenData;
    } catch (err: any) {
      throw new Error(`Could get new token: ${err.message}`);
    }
  }

  public async getSong(artist: string, title: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/search?type=track&q=artist:${encodeURIComponent(
      artist
    )}+track:${encodeURIComponent(title)}`;
    console.log(url);
    try {
      const response = await axios.get<SearchResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err: any) {
      console.log(err.message);
    }
    return undefined;
  }

  public async getAudioAnalysis(trackId: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/audio-analysis/${trackId}`;
    console.log(url);
    const response = await axios.get<AudioAnalysisResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  public async getUrl(url: string) {
    const token = await this.getToken();
    console.log(url);
    const response = await axios.get<any, any>(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }
    );
    return response.data;
}
}
