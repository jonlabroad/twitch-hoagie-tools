import { TwitchChatNotificationEvent } from "../Events/ChannelChatNotificationEvent";
import TokenDbClient from "../Persistance/TokenDBClient";
import { GenerateExpiryTimestamp } from "../Tokens/Expiry";
import { RewardToken } from "../Tokens/RewardToken";

export class SubHandler {
    public async handle(ev: TwitchChatNotificationEvent): Promise<void> {
      const type = "sub";
      const subOrResub = ev.Detail.event.sub ?? ev.Detail.event.resub;

      if (!subOrResub) {
        throw new Error("Sub event is missing sub data");
      }

      console.log({ sub: subOrResub });

      const tier = subOrResub?.sub_tier;
      const now = new Date();
      const ownerId = ev.Detail.event.chatter_user_id;
      const ownerUsername = ev.Detail.event.chatter_user_login;
      const broadcasterId = ev.Detail.event.broadcaster_user_id;
      const token: RewardToken = {
        key: type,
        type: type,
        ownerId: ownerId,
        broadcasterId: broadcasterId,
        ownerUsername: ownerUsername,
        subType: tier,
        value: 1,
        grantTimestamp: now,
        expiryTimestamp: GenerateExpiryTimestamp(type),
      };
      console.log({ token: token });

      const tokenClient = new TokenDbClient(broadcasterId);
      const result = await tokenClient.writeToken(token);
      console.log({ Written: result });

      return Promise.resolve();
    }
}
