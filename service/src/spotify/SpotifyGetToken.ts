import SpotifyDbClient from "./SpotifyDbClient";
import SpotifySetToken from "./SpotifySetToken";

export default class SpotifyGetToken {
    public static async getToken(username: string) {
        let token = await SpotifyDbClient.getToken(username)

        if (!token) {
            console.error(`No existing token is in the database for ${username}`)
            return undefined;
        }

        const now = new Date();
        const tokenTimestamp = new Date(token.timestamp);
        const tokenAgeSec = (now.getTime() - tokenTimestamp.getTime()) / 1e3;
        console.log({token});
        if (tokenAgeSec >= token.expires_in) {
            console.log(`Refreshing token for ${username}`)
            await SpotifySetToken.refreshToken(username, token.refresh_token);
            token = await SpotifyDbClient.getToken(username)
        }

        return token;
    }

}