import DonoDbClientV2 from "../channelDb/DonoDbClientV2";
import { HoagieEventPublisher } from "../eventbus/HoagieEventPublisher";
import TwitchClient from "../twitch/TwitchClient";
import { ResubEvent, SubEvent, getChannelName } from "./ChatEventProcessor";

export class SubProcessor {
  public static async process(event: SubEvent | ResubEvent) {
    console.log("SubProcessor.process", event);
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
        await dbWriter.addSub(
          detail.userstate.id!,
          detail.username,
          stream.id,
          detail.methods.plan!
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
