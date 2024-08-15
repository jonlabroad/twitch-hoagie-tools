import { Resub, TwitchNotificationEvent } from "../Events/ChannelChatNotificationEvent";
import TokenDbClient from "../Persistance/TokenDBClient";
import { GenerateExpiryTimestamp } from "../Tokens/Expiry";
import { RewardToken } from "../Tokens/RewardToken";

export class SubHandler {
    public async handle(ev: TwitchNotificationEvent): Promise<void> {
      const type = "sub";
      const subOrResub = ev.sub ?? ev.resub;

      if (!subOrResub) {
        throw new Error("Sub event is missing sub data");
      }

      if (subOrResub.is_prime) {
        console.log("Prime sub, ignoring");
        return;
      }

      if (ev.resub?.is_gift) {
        console.log("Gift sub, ignoring");
        return;
      }

      console.log({ sub: subOrResub });

      const tier = subOrResub?.sub_tier;
      const now = new Date();
      const ownerId = ev.chatter_user_id;
      const ownerUsername = ev.chatter_user_login;
      const broadcasterId = ev.broadcaster_user_id;
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

      const tokenClient = new TokenDbClient();
      const result = await tokenClient.upsertToken(token);
      console.log({ Written: result });

      return Promise.resolve();
    }
}
