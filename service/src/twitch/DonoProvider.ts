import { SetDonoRequest } from "../../twitch-dono";
import DonoDbClient, { DonoData, DonoResponse } from "../channelDb/DonoDbClient";

export default class DonoProvider {
    public static async get(streamerLogin: string, streamIds?: string[]) {
        const client = new DonoDbClient(streamerLogin);
        let donoDatas: DonoResponse[] = []
        if (!streamIds) {
            donoDatas = [await client.readLatestDonos()];
        } else {
            donoDatas = await Promise.all(streamIds.map((streamId) => client.readDonos(streamId)));
        }
        donoDatas.forEach(donoData => donoData.donos.forEach(dono => {
            dono.value = this.getValue(dono);
        }))
        const donoData = donoDatas[0]
        donoDatas.slice(1).forEach(otherData => donoData.donos.push(...otherData.donos))

        const combinedDonos: DonoData[] = []
        donoDatas.forEach(donoData => {
            donoData.donos.forEach(dono => {
                const existingDono = combinedDonos.find(d => d.SubKey.toLowerCase() === dono.SubKey.toLowerCase())
                if (existingDono) {
                    existingDono.cheer += dono.cheer
                    existingDono.dono += dono.dono
                    existingDono.sub += dono.sub
                    existingDono.subgift += dono.subgift
                    existingDono.value += dono.value
                } else {
                    combinedDonos.push(dono)
                }
            })
        })
        const combinedDonoData: DonoResponse = {
            donos: combinedDonos.sort((a, b) => a.SubKey.localeCompare(b.SubKey)),
            stream: donoData.stream
        }

        return combinedDonoData;
    }

    static getValue(dono: DonoData) {
        return (dono.dono ?? 0) + (dono.cheer ?? 0) / 100 + (dono.sub ?? 0) * (5 * (dono.tier ?? 1)) + (dono.subgift ?? 0) * (5 * (dono.tier ?? 1));
    }

    public static async setDono(request: SetDonoRequest) {
        const client = new DonoDbClient(request.streamerLogin);
        return await client.add(request);
    }
}