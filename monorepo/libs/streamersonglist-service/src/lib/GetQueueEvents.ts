import {
  StreamerSongListClient,
  StreamerSongListSong,
  TwitchClient,
} from '@hoagie/service-clients';
import { SSLEvent, SSLEventDBClient } from './SSLEventDBClient';
import {
  DBResponseCache,
  corsHeaders,
  createCacheHeader,
} from '@hoagie/api-util';
import {
  NewPlayHistoryEvent,
  SongQueueEvent,
} from './client/StreamerSongListEventTypes';

export interface SSLEventListItem {
  eventType: 'queue-event' | 'new-playhistory';
  type: 'added' | 'moved' | 'deleted' | 'played';
  data: SongAddedItem | SongMovedItem | SongDeletedItem | SongPlayedItem;
  userLogin?: string;
  timestamp: string;
  song: string;
  newPosition?: number;
  oldPosition?: number;
  requestorLogin?: string;
}

export interface SongAddedItem {
  song: string;
  by: string;
  position: number;
}

export interface SongMovedItem {
  song: string;
  by: string;
  oldPosition: number;
  newPosition: number;
}

export interface SongDeletedItem {
  song: string;
  by: string;
  position: number;
}

export interface SongPlayedItem {
  song: string;
  requestor: string;
}

export interface GetQueueEventsConfig {
  tableName: string;
  twitchClient: TwitchClient;
}

export interface GetQueueEventsRequest {
  userId?: string;
  userLogin?: string;
  startDate: Date;
  endDate: Date;
}

export class GetQueueEvents {
  config: GetQueueEventsConfig;
  streamerSongListClient: StreamerSongListClient;
  sslSongApiCache: DBResponseCache<string>;

  constructor(config: GetQueueEventsConfig) {
    this.config = config;
    this.streamerSongListClient = new StreamerSongListClient();
    this.sslSongApiCache = new DBResponseCache<string>(
      'SSLSONGAPI',
      config.tableName
    );
  }

  public async getEvents(request: GetQueueEventsRequest) {
    console.log(request);
    let userId: string = request.userId ?? '';
    console.time('getUserId');
    if (!userId) {
      const twitchClient = this.config.twitchClient;
      userId = (await twitchClient.getUserId(request.userLogin!)) ?? '';
    }
    console.timeEnd('getUserId');

    console.time('getSSLEvents');
    const dbReader = new SSLEventDBClient(this.config.tableName);
    const items = await dbReader.get(
      userId,
      request.startDate.getTime(),
      request.endDate.getTime()
    );
    console.timeEnd('getSSLEvents');

    console.time('logItems');
    console.log({ numItems: items?.length ?? 0 });
    //console.log(JSON.stringify(items, null, 2));
    console.timeEnd('logItems');

    console.time('getSSLSongs');
    const { streamerId, songIds: idsToFetch } = this.getSSLSongIdsToFetch(
      items ?? []
    );

    let sslSongs: StreamerSongListSong[] = [];
    if (streamerId) {
      sslSongs = (
        await Promise.all(
          [...idsToFetch.values()].map((songId) => {
            return this.getSSLSong(streamerId, songId);
          })
        )
      ).filter((s) => !!s) as StreamerSongListSong[];
    }
    const songRepo = sslSongs.reduce((acc, s) => {
      acc[s.id] = `${s.title}${s.artist ? ` - ${s.artist}` : ''}`;
      return acc;
    }, {} as Record<string, string>);
    console.log({ songRepo });
    console.timeEnd('getSSLSongs');

    const transformedItems = items
      ?.map((item) => this.transformEvent(item, songRepo))
      .filter((i) => !!i) as SSLEventListItem[];

    return {
      statusCode: 200,
      body: JSON.stringify(transformedItems),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(5),
      },
    };
  }

  private transformEvent(
    sslEventBridgeEvent: SSLEvent,
    sslSongs: Record<string, string>
  ): SSLEventListItem | undefined {
    const inputType = sslEventBridgeEvent?.['detail-type'];
    const sslEvent = sslEventBridgeEvent.detail;
    if (inputType == 'queue-event') {
      const sslData = sslEvent.eventData as SongQueueEvent;
      const eventType = 'queue-event';
      if (sslData.added) {
        return {
          eventType,
          type: 'added',
          data: {
            song: sslData.nonlistSong ?? `${sslData.title} - ${sslData.artist}`,
            by: sslData.by,
            position: sslData.position!,
          },
          userLogin: sslData.by,
          timestamp: sslEventBridgeEvent.time,
          song: sslData.title,
        };
      } else if (sslData.oldPosition && sslData.position) {
        return {
          eventType,
          type: 'moved',
          data: {
            song: sslData.nonlistSong ?? `${sslData.title} - ${sslData.artist}`,
            by: sslData.by,
            oldPosition: sslData.oldPosition,
            newPosition: sslData.position!,
          },
          userLogin: sslData.by,
          timestamp: sslEventBridgeEvent.time,
          song: sslData.title,
        };
      } else if (sslData.deleted) {
        return {
          eventType,
          type: 'deleted',
          data: {
            song: sslData.nonlistSong ?? `${sslData.title} - ${sslData.artist}`,
            by: sslData.by,
            position: sslData.position!,
          },
          userLogin: sslData.by,
          timestamp: sslEventBridgeEvent.time,
          song: sslData.title,
        };
      }
    } else if (inputType == 'new-playhistory') {
      const sslData = sslEvent.eventData as NewPlayHistoryEvent;
      const song =
        sslData.nonlistSong ?? sslSongs[`${sslData.songId}`] ?? sslData.songId;
      return {
        eventType: 'new-playhistory',
        type: 'played',
        data: {
          song,
          requestor: sslData.requests?.[0]?.name ?? '',
        },
        timestamp: sslEventBridgeEvent.time,
        song: song,
      };
    }
    return undefined;
  }

  private getSSLSongIdsToFetch(items: SSLEvent[]) {
    let streamerId: string | undefined = undefined;
    const songIds = new Set<string>();

    items.forEach((ev) => {
      switch (ev['detail-type']) {
        case 'queue-event':
          break;
        case 'new-playhistory':
          const playHistoryEvent = ev.detail.eventData as NewPlayHistoryEvent;
          streamerId = `${playHistoryEvent.streamerId}`;
          if (playHistoryEvent.songId) {
            songIds.add(`${playHistoryEvent.songId}`);
          }
          break;
        default:
          break;
      }
    });
    return {
      streamerId,
      songIds,
    };
  }

  private async getSSLSong(streamerId: string, songId: string | number) {
    const cachedSong = await this.sslSongApiCache.get(
      `${streamerId}_${songId}`,
      '1.0.0'
    );
    if (cachedSong) {
      return cachedSong;
    }

    const song = await this.streamerSongListClient.getSong(
      streamerId,
      songId.toString()
    );

    if (song) {
      await this.sslSongApiCache.set(`${streamerId}_${songId}`, song, '1.0.0', 90 * 60 * 24);
    }

    return song;
  }
}
