import { TwitchClient } from "@hoagie/service-clients";
import { CheerEvent, getChannelName } from "./ChatEventProcessor";
import DonoDbClient from "./DonoDbClient";
import { HoagieEventPublisher } from "@hoagie/api-util";

export class CheerProcessor {
  public static async process(event: CheerEvent, twitchClient: TwitchClient, tableName: string) {
    console.log("CheerProcessor.process", event);
    const broadcasterLogin = getChannelName(event.detail.channel);
    const [broadcasterId, userId] = await Promise.all([
      twitchClient.getUserId(broadcasterLogin),
      (async () => { try { return event.detail.userstate.username && twitchClient.getUserId(event.detail.userstate.username) } catch (e) { return undefined } })(),
    ]);
    if (broadcasterId) {
      const stream = await twitchClient.getBroadcasterIdLiveStream(
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
          userId
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
