import { TwitchClient } from '@hoagie/service-clients';
import { ResubEvent, SubEvent, getChannelName } from './ChatEventProcessor';
import DonoDbClient from './DonoDbClient';
import { HoagieEventPublisher } from '@hoagie/api-util';

export class SubProcessor {
  public static async process(
    event: SubEvent | ResubEvent,
    twitchClient: TwitchClient,
    tableName: string
  ) {
    console.log('SubProcessor.process', event);
    const broadcasterLogin = getChannelName(event.detail.channel);
    const [broadcasterId, userId] = await Promise.all([
      twitchClient.getUserId(broadcasterLogin),
      (async () => { try { return twitchClient.getUserId(event.detail.username) } catch (e) { return undefined } })(),
    ]);
    if (broadcasterId) {
      const stream = await twitchClient.getBroadcasterIdLiveStream(
        broadcasterId
      );
      if (stream) {
        const dbWriter = new DonoDbClient(broadcasterId, tableName);
        const detail = event.detail;
        await dbWriter.addSub(
          detail.userstate.id!,
          detail.username,
          stream.id,
          detail.methods.plan!,
          userId,
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
