import axios from "axios";

export interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface SearchResponse {
    tracks: {
        href: string
        items: SpotifySong[]
    }
}

export interface SpotifySong {
    album: SpotifyAlbum
    artists: SpotifyArtist[]
    href: string
    name: string
    url: string
}

export interface SpotifyAlbum {
    name: string
    uri: string
}

export interface SpotifyArtist {
    name: string
    uri: string
}

export default class SpotifyClient {
    public async getToken(code: string, redirectUri: string) {
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_url", redirectUri);
        const response = await axios.post<TokenResponse>("https://accounts.spotify.com/api/token", params as any, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            }
        });
        const tokenData = response.data;
        console.log({tokenData});
        return tokenData.access_token;
    }
}