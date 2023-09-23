import { SetDonoRequest } from "../../twitch-dono";
import DonoDbClient, {
  DonoDataV2,
  DonoResponseV2,
} from "../channelDb/DonoDbClient";
import DonoDbClientV2 from "../channelDb/DonoDbClientV2";
import TwitchClient from "./TwitchClient";

export default class DonoProviderV2 {
  public static async get(streamerLogin: string, streamIds: string[]) {
    const broadcasterId = await new TwitchClient().getUserId(streamerLogin);
    if (broadcasterId) {
      const client = new DonoDbClientV2(broadcasterId);
      let donoDatas: DonoResponseV2[] = [];
      donoDatas = await Promise.all(
        streamIds.map((streamId) => client.readDonos(streamId))
      );
      donoDatas.forEach((donoData) =>
        donoData.donos.forEach((dono) => {
          dono.value = this.getValue(dono);
        })
      );
      const donoData = donoDatas[0];
      donoDatas
        .slice(1)
        .forEach((otherData) => donoData.donos.push(...otherData.donos));

      const combinedDonos: DonoDataV2[] = [];
      donoDatas.forEach((donoData) => {
        donoData.donos.forEach((dono) => {
          const existingDono = combinedDonos.find(
            (d) => d.SubKey.toLowerCase() === dono.SubKey.toLowerCase()
          );
          if (existingDono) {
            existingDono.hypechat += dono.hypechat ?? 0;
            existingDono.cheer += dono.cheer;
            existingDono.dono += dono.dono;
            existingDono.sub += dono.sub;
            existingDono.subgift +=
              dono.subgift ?? (dono.type === "subgift" ? 1 : 0);
            existingDono.value += dono.value;
          } else {
            combinedDonos.push(dono);
          }
        });
      });
      const combinedDonoData: DonoResponseV2 = {
        donos: combinedDonos.sort((a, b) => a.SubKey.localeCompare(b.SubKey)),
        stream: donoData.stream,
      };

      return combinedDonoData;
    }
  }

  static getValue(dono: DonoDataV2) {
    return (
      (dono.dono ?? 0) +
      (dono.hypechat ?? 0) +
      (dono.cheer ?? 0) / 100 +
      (dono.sub ?? 0) * this.getTierValue(dono.tier) +
      (dono.subgift ?? 0) * this.getTierValue(dono.tier)
    );
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

  public static async setDono(request: SetDonoRequest) {
    const client = new DonoDbClient(request.streamerLogin);
    const donos = await client.add(request);
    return donos;
  }
}
