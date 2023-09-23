import DonoDbClientV2 from "../channelDb/DonoDbClientV2";
import TwitchClient from "../twitch/TwitchClient";
import { SubGiftEvent, getChannelName } from "./ChatEventProcessor";

export class SubGiftProcessor {
  public static async process(event: SubGiftEvent) {
    console.log("SubGiftProcessor.process", event);
    const twitchClient = new TwitchClient();
    const broadcasterLogin = getChannelName(event.detail.channel);
    const broadcasterId = await twitchClient.getUserId(broadcasterLogin);
    if (broadcasterId) {
      const stream = await twitchClient.getBroadcasterIdLiveStream(
        broadcasterId
      );
      if (stream) {
        const dbWriter = new DonoDbClientV2(broadcasterId);
        const detail = event.detail;
        await dbWriter.addGiftSubs(
          detail.userstate.id!,
          detail.username,
          stream.id,
          detail.methods.plan!,
          detail.recipient
        );
      }
    }
  }
}
