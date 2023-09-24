import DonoDbClientV2 from "../channelDb/DonoDbClientV2";
import { HoagieEventPublisher } from "../eventbus/HoagieEventPublisher";
import TwitchClient from "../twitch/TwitchClient";
import { CheerEvent, getChannelName } from "./ChatEventProcessor";

export class CheerProcessor {
  public static async process(event: CheerEvent) {
    const twitchClient = new TwitchClient();
    console.log("CheerProcessor.process", event);
    const broadcasterLogin = getChannelName(event.detail.channel);
    const broadcasterId = await twitchClient.getUserId(broadcasterLogin);
    if (broadcasterId) {
      const stream = await twitchClient.getBroadcasterIdLiveStream(
        broadcasterId
      );
      if (stream) {
        const dbWriter = new DonoDbClientV2(broadcasterId);
        const detail = event.detail;
        await dbWriter.addCheer(
          detail.userstate.id!,
          detail.userstate.username!,
          stream.id,
          parseInt(detail.userstate.bits ?? "0")
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
