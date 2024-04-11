import StreamerSongListClient from "./StreamerSongListClient";
import StreamerSongListDbClient from "./StreamerSongListDbClient";

export default class StreamerSongListToken {
    public static async validateToken(userId: string, token: string): Promise<boolean> {
        const client = new StreamerSongListClient(token);
        return await client.isAdmin(userId);
    }

    public static async setToken(userId: string, token: string) {
        await StreamerSongListDbClient.setToken(userId, token);
    }

    public static async readToken(userId: string): Promise<string | undefined> {
        const item = await StreamerSongListDbClient.getToken(userId);
        return item?.Value?.token as string;
    }
}