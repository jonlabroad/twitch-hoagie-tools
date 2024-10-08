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
            const response5 = await client.createSubscription("channel.chat.notification", {
                broadcaster_user_id: broadcasterId,
                user_id: broadcasterId
            });
            const response6 = await client.createSubscription("channel.chat.message", {
                broadcaster_user_id: broadcasterId,
                user_id: broadcasterId,
            });
            const response7 = await client.createSubscription("channel.channel_points_custom_reward_redemption.add", {
                broadcaster_user_id: broadcasterId,
            });

            return response ?? {};
        }
    }
}