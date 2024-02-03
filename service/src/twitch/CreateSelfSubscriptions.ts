import TwitchClient from "./TwitchClient";

export default class CreateSelfSubscriptions {
    public static async create(broadcasterLogin: string): Promise<any> {
        const client = new TwitchClient();
        const broadcasterId = await (new TwitchClient().getUserId(broadcasterLogin));
        if (broadcasterId) {
            const response = await client.createSubscription(broadcasterLogin, "channel.cheer", {
                broadcaster_user_id: broadcasterId
            });
            const response2 = await client.createSubscription(broadcasterLogin, "channel.subscribe", {
                broadcaster_user_id: broadcasterId
            });
            const response3 = await client.createSubscription(broadcasterLogin, "channel.subscription.gift", {
                broadcaster_user_id: broadcasterId
            });

            return response ?? {};
        }
    }
}