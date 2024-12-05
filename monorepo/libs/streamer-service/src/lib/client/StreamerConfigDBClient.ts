import { ISimpleObjectDBClient } from '../util/ISimpleObjectDBClient';

export interface StreamerConfigData {
  broadcasterId?: string;
  twitchPlus: {
    goal: number;
    trackingEnabled: boolean;
  };
}

export const defaultStreamerConfigData: StreamerConfigData = {
  twitchPlus: {
    goal: 100,
    trackingEnabled: false,
  },
};

export interface StreamerConfigDataKey {
  broadcasterId: string;
}

export class StreamerConfigDBClient extends ISimpleObjectDBClient<
  StreamerConfigDataKey,
  StreamerConfigData
> {
  protected readonly CATEGORY = 'STREAMERCONFIG';
  protected readonly defaultValue = defaultStreamerConfigData;

  constructor(tableName: string, broadcasterId: string = "NULL_BROADCASTER_ID") {
    super(tableName);
    this.defaultValue.broadcasterId = broadcasterId;
  }

  protected getKey(key: StreamerConfigDataKey): string {
    return `${this.CATEGORY}`;
  }

  protected getSort(key: StreamerConfigDataKey): string {
    return `${key.broadcasterId}`;
  }
}
