import Config from "../Config";
import TwitchClient from "./TwitchClient";

export default class CreateSubscriptions {
    public static async create(username: string): Promise<any> {
        const client = new TwitchClient();
        const response = await client.createSubscription(username, "channel.channel_points_custom_reward_redemption.add");
        const response2 = await client.createSubscription(username, "channel.update");
        return response;
    }
}