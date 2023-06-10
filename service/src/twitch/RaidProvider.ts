import RaidDbClient from "../channelDb/RaidDbClient";
import TwitchClient from "./TwitchClient";

export default class RaidProvider {
    public static async get(streamerLogin: string) {
        const broadcasterId = await (new TwitchClient()).getUserId(streamerLogin);
        if (!broadcasterId) {
            throw new Error(`Unable to get broadcaster id from streamer login "${streamerLogin}"`);
        }
        const client = new RaidDbClient(broadcasterId);
        const raids = await client.readRaids();
        return raids;
    }
}