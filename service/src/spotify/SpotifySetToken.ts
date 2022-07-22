import SpotifyClient from "./SpotifyClient";
import SpotifyDbClient, { DbTokenValue } from "./SpotifyDbClient";

export default class SpotifySetToken {
    public static async setToken(username: string, authToken: string, redirectUri: string) {
        const spotifyClient = new SpotifyClient();
        const tokenData = await spotifyClient.getToken("authorization_code", authToken, redirectUri);
        await SpotifyDbClient.setToken(username, tokenData);
    }

    public static async readToken(username: string): Promise<string | undefined> {
        const item = await SpotifyDbClient.getToken(username);
        return (item?.Value as DbTokenValue)?.access_token as string;
    }

    public static async refreshToken(username: string, refreshToken: string) {
        const spotifyClient = new SpotifyClient();
        const tokenData = await spotifyClient.refreshToken(refreshToken);
        await SpotifyDbClient.setToken(username, tokenData, refreshToken);
    }
}