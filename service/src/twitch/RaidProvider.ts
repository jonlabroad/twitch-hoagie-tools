import RaidDbClient from "../channelDb/RaidDbClient";

export default class RaidProvider {
    public static async get(streamerId: string) {
        const client = new RaidDbClient(streamerId);
        const raids = await client.readRaids();
        return raids;
    }
}