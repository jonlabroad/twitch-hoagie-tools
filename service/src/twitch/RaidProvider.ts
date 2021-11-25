import RaidDbClient from "../channelDb/RaidDbClient";

export default class RaidProvider {
    public static async get(streamerLogin: string) {
        const client = new RaidDbClient(streamerLogin);
        const raids = await client.readRaids();
        return raids;
    }
}