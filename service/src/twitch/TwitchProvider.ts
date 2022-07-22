import TwitchClient from "./TwitchClient";
import { UserData } from "./TwitchClientTypes";

interface Response {
    userData: UserData;
    follows: boolean;
}

export default class TwitchProvider {
    public static async getUserData(streamerLogin: string, userLogin: string): Promise<Response> {
        const follows = await this.doesFollow(streamerLogin, userLogin);
        const userData = await this.getUser(userLogin);
        return {
            follows,
            userData,
        }
    }

    private static async doesFollow(streamerLogin: string, userLogin: string) {
        if (streamerLogin.toLowerCase() === userLogin.toLowerCase()) {
            return true;
        }

        const client = new TwitchClient();
        const [streamerId, userId] = await Promise.all([
            client.getUserId(streamerLogin),
            client.getUserId(userLogin)
        ]);

        if (streamerId && userId) {
            const follows = await client.getUserFollows(streamerId, userId);
            return follows.length > 0;
        }
        return false;
    }

    private static async getUser(userLogin: string) {
        const client = new TwitchClient();
        return await client.getUserData(userLogin);
    }
}