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

    return response ?? {};
  }
}
