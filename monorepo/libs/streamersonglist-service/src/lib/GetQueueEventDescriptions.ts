import { TwitchClient, UserData } from '@hoagie/service-clients';
import { SSLEvent, SSLEventDBClient } from './SSLEventDBClient';
import { corsHeaders, createCacheHeader } from '@hoagie/api-util';
import { SSLEventDescriptionGenerator } from './SSLEventDescriptionGenerator';
import { SongQueueEvent } from './client/StreamerSongListEventTypes';

export interface GetQueueEventDescriptionsConfig {
  tableName: string;
  twitchClient: TwitchClient;
}

export interface GetQueueEventDescriptionsRequest {
  userId?: string;
  userLogin?: string;
  startDate: Date;
  endDate: Date;
}

export class GetQueueEventDescriptions {
  config: GetQueueEventDescriptionsConfig;

  constructor(config: GetQueueEventDescriptionsConfig) {
    this.config = config;
  }

  public async getEventDescriptions(request: GetQueueEventDescriptionsRequest) {
    console.log(request);
    let userId: string = request.userId ?? '';
    if (!userId) {
      const twitchClient = this.config.twitchClient;
      userId = (await twitchClient.getUserId(request.userLogin!)) ?? '';
    }

    console.time('getSSLEvents');
    const dbReader = new SSLEventDBClient(this.config.tableName);
    const items = (await dbReader.get(
      userId,
      request.startDate.getTime(),
      request.endDate.getTime()
    ) ?? []).filter(item => !!item) as SSLEvent[];
    console.timeEnd('getSSLEvents');

    console.time('getTwitchUserInfo');
    const twitchUsersToFetch = this.getUserInfosToFetch(items);
    const userFetchPromises = [...twitchUsersToFetch.values()].map(
      async (userName) => {
        return await this.getUserData(userName);
      }
    );
    const userInfos = (await Promise.all(userFetchPromises))
      .filter((u) => !!u)
      .reduce((acc, u) => {
        acc[u!.login.toLowerCase()] = u!;
        return acc;
      }, {} as Record<string, UserData>);
    console.timeEnd('getTwitchUserInfo');

    console.time('generateSSLEventDescription');
    const generator = new SSLEventDescriptionGenerator();
    const descriptions = (
      await Promise.all(
        (items ?? []).map((item) => generator.generateSSLEventDescription(item, userInfos))
      )
    ).filter((d) => !!d);
    console.timeEnd('generateSSLEventDescription');

    return {
      statusCode: 200,
      body: JSON.stringify(descriptions),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(5),
      },
    };
  }

  private getUserInfosToFetch(events: SSLEvent[]) {
    const userNames = new Set<string>();

    events.forEach((ev) => {
      switch (ev['detail-type']) {
        case 'queue-event':
          const queueEvent = ev.detail.eventData as SongQueueEvent;
          if (queueEvent.by) {
            userNames.add(queueEvent.by.toLowerCase());
          }
          break;
        case 'new-playhistory':
          break;
        default:
          break;
      }
    });
    return userNames;
  }

  private async getUserData(userName: string): Promise<UserData | undefined> {
    try {
      const userData = await this.config.twitchClient.getUserData(userName);
      return userData;
    } catch (err) {
      console.log(err);
    }
    return undefined;
  }
}
