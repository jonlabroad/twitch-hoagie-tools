import { TwitchClient } from '@hoagie/service-clients';
import { SSLEventDBWriter } from './SSLEventDBWriter';
import { SongListEvent } from './client/StreamerSongListEventTypes';
import { EventBridgeEvent } from 'aws-lambda';

const eventTypesToWrite = ['queue-event', 'new-playhistory'];

export interface WriteQueueEventConfig {
  tableName: string;
  twitchClient: TwitchClient;
}

export class WriteQueueEvent {
  config: WriteQueueEventConfig;

  constructor(config: WriteQueueEventConfig) {
    this.config = config;
  }

  public async writeEvent(ev: EventBridgeEvent<string, SongListEvent>) {
    try {
      console.log(ev);
      if (eventTypesToWrite.includes(ev["detail-type"]?.toLowerCase())) {
        const dbWriter = new SSLEventDBWriter(
          this.config.tableName,
          this.config.twitchClient
        );
        await dbWriter.writeEvent(ev);
      } else {
        console.log(`Event type ${ev["detail-type"]} not a writeable songlist event type`)
      }
      return {
        statusCode: 200,
        body: 'cool',
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: 'error',
      };
    }
  }
}
