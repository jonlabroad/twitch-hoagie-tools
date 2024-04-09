import TwitchClient from "./TwitchClient";

export default class CreateSelfSubscriptions {
    public static async create(broadcasterId: string): Promise<any> {
        const client = new TwitchClient();
        if (broadcasterId) {
            const response = await client.createSubscription("channel.cheer", {
                broadcaster_user_id: broadcasterId
            });
            const response2 = await client.createSubscription("channel.subscribe", {
                broadcaster_user_id: broadcasterId
            });
            const response3 = await client.createSubscription("channel.subscription.gift", {
                broadcaster_user_id: broadcasterId
            });
            const response4 = await client.createSubscription("channel.subscription.message", {
                broadcaster_user_id: broadcasterId
            });


            return response ?? {};
        }
    }
}