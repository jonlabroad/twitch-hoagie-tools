import TwitchClient from "./TwitchClient";

export default class TwitchProvider {
    public static async doesUserFollow(streamerLogin: string, userLogin: string) {
        if (streamerLogin.toLowerCase() === userLogin.toLowerCase()) {
            return true;
        }

        const client = new TwitchClient();
        const [streamerId, userId] = await Promise.all([
            client.getUserId(streamerLogin),
            client.getUserId(userLogin)
        ]);
        console.log({streamerId, userId});
        if (streamerId && userId) {
            const follows = await client.getUserFollows(streamerId, userId);
            console.log({follows});
            return follows.length > 0;
        }
        return false;
    }
}