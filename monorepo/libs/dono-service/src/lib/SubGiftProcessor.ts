import { TwitchClient } from "@hoagie/service-clients";
import { SubGiftEvent, getChannelName } from "./ChatEventProcessor";
import { HoagieEventPublisher } from "@hoagie/api-util";
import DonoDbClient from "./DonoDbClient";

export class SubGiftProcessor {
  twitchClient: TwitchClient
  tableName: string

  constructor(twitchClient: TwitchClient, tableName: string) {
    this.twitchClient = twitchClient;
    this.tableName = tableName;
  }

  public async process(event: SubGiftEvent) {
    console.log("SubGiftProcessor.process", event);
    const broadcasterLogin = getChannelName(event.detail.channel);
    const [broadcasterId, userId] = await Promise.all([
      this.twitchClient.getUserId(broadcasterLogin),
      (async () => { try { return this.twitchClient.getUserId(event.detail.username) } catch (e) { return undefined } })(),
    ]);
    if (broadcasterId) {
      const stream = await this.twitchClient.getBroadcasterIdLiveStream(
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
          userId,
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
