import { TwitchClient } from '@hoagie/service-clients';
import { ResubEvent, SubEvent, getChannelName } from './ChatEventProcessor';
import DonoDbClient from './DonoDbClient';
import { HoagieEventPublisher } from '@hoagie/api-util';
import { TwitchUserIdProvider } from './util/TwitchUserIdProvider';
import { TwitchBroadcasterLiveStreamProvider } from './util/TwitchBroadcasterLiveStreamProvider';

export class SubProcessor {
  public static async process(
    event: SubEvent | ResubEvent,
    twitchClient: TwitchClient,
    tableName: string
  ) {
    console.log('SubProcessor.process', event);
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
        await dbWriter.addSub(
          detail.userstate.id!,
          detail.username,
          stream.id,
          detail.methods.plan!,
          detail.userstate['user-id'],
        );
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, {});
      }
    }
  }
}
