import { SetDonoRequest } from "../../twitch-dono";
import DonoDbClient, { DonoData } from "../channelDb/DonoDbClient";

export default class DonoProvider {
    public static async get(streamerLogin: string) {
        const client = new DonoDbClient(streamerLogin);
        const donoData = await client.readLatestDonos();
        console.log({ donoData });
        donoData.donos.forEach(dono => {
            console.log({ dono });
            dono.value = this.getValue(dono);
        })
        return donoData;
    }

    static getValue(dono: DonoData) {
        return (dono.dono ?? 0) + (dono.cheer ?? 0) / 100 + (dono.sub ?? 0) * (5 * (dono.tier ?? 1)) + (dono.subgift ?? 0) * (5 * (dono.tier ?? 1));
    }

    public static async setDono(request: SetDonoRequest) {
        const client = new DonoDbClient(request.streamerLogin);
        return await client.add(request);
    }
}