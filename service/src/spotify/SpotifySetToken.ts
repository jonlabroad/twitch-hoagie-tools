import SpotifyClient from "./SpotifyClient";
import SpotifyDbClient from "./SpotifyDbClient";

export default class SpotifySetToken {
    public static async setToken(username: string, authToken: string, redirectUri: string) {
        const spotifyClient = new SpotifyClient();
        const token = await spotifyClient.getToken("authorization_code", authToken, redirectUri);
        await SpotifyDbClient.setToken(username, token);
    }

    public static async readToken(username: string): Promise<string | undefined> {
        const item = await SpotifyDbClient.getToken(username);
        return item?.Value?.token as string;
    }
}