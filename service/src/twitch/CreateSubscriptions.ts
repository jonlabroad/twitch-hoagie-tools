import TwitchClient from "./TwitchClient";

export default class CreateSubscriptions {
  public static async create(broadcasterId: string): Promise<any> {
    const client = new TwitchClient();
    const response = await client.createSubscription(
      "channel.raid",
      {
        to_broadcaster_user_id: broadcasterId,
      }
    );
    await client.createSubscription("channel.raid", {
      from_broadcaster_user_id: broadcasterId,
    });
    await client.createSubscription("stream.online", {
      broadcaster_user_id: broadcasterId,
    });
    await client.createSubscription("stream.offline", {
      broadcaster_user_id: broadcasterId,
    });
    // TODO do this better, not hardcoding my user id?
    const response5 = await client.createSubscription("channel.chat.notification", {
      broadcaster_user_id: broadcasterId,
      user_id: "408982109" // hoagieman5000
    });
    const response6 = await client.createSubscription("channel.chat.message", {
        broadcaster_user_id: broadcasterId,
        user_id: "408982109", // hoagieman5000
    });

    return response ?? {};
  }
}
