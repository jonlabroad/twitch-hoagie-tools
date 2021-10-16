import StreamerSongListClient from "./StreamerSongListClient";
import StreamerSongListDbClient from "./StreamerSongListDbClient";

export default class StreamerSongListToken {
    public static async validateToken(username: string, token: string): Promise<boolean> {
        const client = new StreamerSongListClient(token);
        return await client.isAdmin(username);
    }

    public static async setToken(username: string, token: string) {
        await StreamerSongListDbClient.setToken(username, token);
    }

    public static async readToken(username: string): Promise<string | undefined> {
        const item = await StreamerSongListDbClient.getToken(username);
        return item?.Value?.token as string;
    }
}