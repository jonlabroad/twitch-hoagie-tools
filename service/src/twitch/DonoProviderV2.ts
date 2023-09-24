import { SetDonoRequest } from "../../twitch-dono";
import DonoDbClientV2, { DonoDataV2 } from "../channelDb/DonoDbClientV2";
import TwitchClient from "./TwitchClient";

export interface UserDonoSummary {
  username: string;
  value: number;
  subs: number;
  subgifts: number;
  bits: number;
  dono: number;
  hypechat: number;
}

export default class DonoProviderV2 {
  public static async get(
    streamerLogin: string,
    streamIds: string[]
  ): Promise<Record<string, UserDonoSummary>> {
    const summaries: Record<string, UserDonoSummary> = {};
    const broadcasterId = await new TwitchClient().getUserId(streamerLogin);
    if (broadcasterId) {
      const client = new DonoDbClientV2(broadcasterId);
      let donoDatas: DonoDataV2[] = [];
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
          };
          summaries[username] = summary;
        }
        summary.value += this.getValue(donoData);
        summary.subs += donoData.type === "subscription" ? 1 : 0;
        summary.subgifts += donoData.type === "subgift" ? 1 : 0;
        summary.bits += donoData.type === "cheer" ? donoData.amount : 0;
        summary.dono += donoData.type === "dono" ? donoData.amount : 0;
        summary.hypechat += donoData.type === "hypechat" ? donoData.amount : 0;
      });
    }
    return summaries;
  }

  static getValue(dono: DonoDataV2) {
    switch (dono.type) {
      case "subscription":
        return this.getTierValue(dono.subTier);
      case "subgift":
        return this.getTierValue(dono.subTier);
      case "cheer":
        return dono.amount / 100;
      case "dono":
        return dono.amount;
      case "hypechat":
        return dono.amount;
      default:
        return 0;
    }
  }

  static getTierValue(tier?: string) {
    switch (`${tier}`) {
      case "prime":
        return 5;
      case "1000":
        return 5;
      case "2000":
        return 10;
      case "3000":
        return 25;
      default:
        return 5;
    }
  }
}
