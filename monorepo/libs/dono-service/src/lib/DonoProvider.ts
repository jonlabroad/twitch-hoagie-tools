import { DonoData, UserDonoSummary } from '../lib/DonoTypes';
import DonoDbClient from './DonoDbClient';
import { TwitchClient } from '@hoagie/service-clients';

export class DonoProvider {
  private twitchClient: TwitchClient;
  private tableName: string;

  constructor(twitchClient: TwitchClient, tableName: string) {
    this.twitchClient = twitchClient;
    this.tableName = tableName;
  }

  public async get(
    broadcasterId: string,
    streamIds: string[]
  ): Promise<Record<string, UserDonoSummary>> {
    const summaries: Record<string, UserDonoSummary> = {};
    const client = new DonoDbClient(broadcasterId, this.tableName);
    let donoDatas: DonoData[] = [];
    donoDatas = (
      await Promise.all(
        streamIds.map((streamId) => client.readDonos(streamId))
      )
    ).flat();
    donoDatas.forEach((donoData) => {
      const username = donoData.username.toLowerCase();
      let summary = summaries[donoData.username.toLowerCase()];
      if (!summary) {
        summary = {
          username,
          value: 0,
          subs: 0,
          subgifts: 0,
          bits: 0,
          dono: 0,
          hypechat: 0,
          subtier: '',
          userId: donoData.twitchUserId,
        };
        summaries[username] = summary;
      }

      if (donoData.type === 'subscription') {
        summary.subtier = donoData.subTier ?? '';
      }

      summary.value += DonoProvider.getValue(donoData);
      summary.subs += donoData.type === 'subscription' ? 1 : 0;
      summary.subgifts += donoData.type === 'subgift' ? 1 : 0;
      summary.bits += donoData.type === 'cheer' ? donoData.amount : 0;
      summary.dono += donoData.type === 'dono' ? donoData.amount : 0;
      summary.hypechat += donoData.type === 'hypechat' ? donoData.amount : 0;
    });
    return summaries;
  }

  static getValue(dono: DonoData) {
    switch (dono.type) {
      case 'subscription':
        return this.getTierValue(dono.subTier);
      case 'subgift':
        return this.getTierValue(dono.subTier);
      case 'cheer':
        return dono.amount / 100;
      case 'dono':
        return dono.amount;
      case 'hypechat':
        return dono.amount;
      default:
        return 0;
    }
  }

  static getTierValue(tier?: string) {
    switch (`${tier}`) {
      case 'prime':
        return 5;
      case '1000':
        return 6;
      case '2000':
        return 10;
      case '3000':
        return 25;
      default:
        return 5;
    }
  }
}
