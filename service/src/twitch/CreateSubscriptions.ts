import TwitchClient from "./TwitchClient";

export default class CreateSubscriptions {
    public static async create(broadcasterLogin: string): Promise<any> {
        const client = new TwitchClient();
        const broadcasterId = await (new TwitchClient().getUserId(broadcasterLogin));
        if (broadcasterId) {
            const response = await client.createSubscription(broadcasterLogin, "channel.raid", {
                "to_broadcaster_user_id": broadcasterId
            });
            const response2 = await client.createSubscription(broadcasterLogin, "channel.raid", {
                "from_broadcaster_user_id": broadcasterId
            });

            return response ?? {};
        }
    }
}