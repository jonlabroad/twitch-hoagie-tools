import { TwitchClient } from "@hoagie/service-clients";
import { SubGiftEvent, getChannelName } from "./ChatEventProcessor";
import { DBResponseCache, HoagieEventPublisher } from "@hoagie/api-util";
import DonoDbClient from "./DonoDbClient";
import { createDocClient } from "./util/DBUtil";
import { TwitchUserIdProvider } from "./util/TwitchUserIdProvider";
import { TwitchBroadcasterLiveStreamProvider } from "./util/TwitchBroadcasterLiveStreamProvider";

export class SubGiftProcessor {
  twitchClient: TwitchClient
  tableName: string

  constructor(twitchClient: TwitchClient, tableName: string) {
    this.twitchClient = twitchClient;
    this.tableName = tableName;
  }

  public async process(event: SubGiftEvent) {
    console.log("SubGiftProcessor.process", event);
    const userIdProvider = new TwitchUserIdProvider(this.twitchClient, this.tableName);

    const broadcasterLogin = getChannelName(event.detail.channel);
    const broadcasterId = await userIdProvider.getUserId(broadcasterLogin);
    if (broadcasterId) {
      const liveStreamProvider = new TwitchBroadcasterLiveStreamProvider(this.twitchClient, this.tableName);
      const stream = await liveStreamProvider.getLiveStream(
        broadcasterId
      );
      if (stream) {
        const dbWriter = new DonoDbClient(broadcasterId, this.tableName);
        const detail = event.detail;
        await dbWriter.addGiftSubs(
          detail.userstate.id!,
          detail.username,
          stream.id,
          detail.methods.plan!,
          detail.recipient,
          detail.userstate["user-id"],
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
