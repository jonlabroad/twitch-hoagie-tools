import TwitchClient from "./TwitchClient";
import { TwitchSubscription } from "./TwitchSubscription";

export default class ListSubscriptions {
    public static async list(): Promise<TwitchSubscription[]> {
        console.log("Listing subscriptions");
        const client = new TwitchClient();
        const subscriptions = await client.listSubscriptions();
        return subscriptions.data;
    }
}