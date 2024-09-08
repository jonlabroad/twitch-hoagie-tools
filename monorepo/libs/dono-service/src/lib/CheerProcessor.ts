import { TwitchClient } from "@hoagie/service-clients";
import { CheerEvent, getChannelName } from "./ChatEventProcessor";
import DonoDbClient from "./DonoDbClient";
import { TwitchUserIdProvider } from "./util/TwitchUserIdProvider";
import { TwitchBroadcasterLiveStreamProvider } from "./util/TwitchBroadcasterLiveStreamProvider";
import { HoagieEventPublisher } from "@hoagie/api-util";

export class CheerProcessor {
  public static async process(event: CheerEvent, twitchClient: TwitchClient, tableName: string) {
    console.log("CheerProcessor.process", event);
    const userIdProvider = new TwitchUserIdProvider(twitchClient, tableName);

    const broadcasterLogin = getChannelName(event.detail.channel);
    const broadcasterId = await userIdProvider.getUserId(broadcasterLogin);
    if (broadcasterId) {
      const liveStreamProvider = new TwitchBroadcasterLiveStreamProvider(twitchClient, tableName);
      const stream = await liveStreamProvider.getLiveStream(
        broadcasterId
      );
      if (stream) {
        const dbWriter = new DonoDbClient(broadcasterId, tableName);
        const detail = event.detail;
        await dbWriter.addCheer(
          detail.userstate.id!,
          detail.userstate.username!,
          stream.id,
          parseInt(detail.userstate.bits ?? "0"),
          detail.userstate["user-id"],
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
