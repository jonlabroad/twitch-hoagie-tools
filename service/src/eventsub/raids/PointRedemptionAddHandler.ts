import StreamerSongListClient from "../../StreamerSongList/StreamerSongListClient";
import StreamerSongListDbClient from "../../StreamerSongList/StreamerSongListDbClient";
import TwitchWebhookEvent from "../../twitch/TwitchWebhook";
import { EventHandler } from "../EventHandler";
import { PointRedemptionAddEvent } from "../events/PointRedemptionAddEvent";

export default class PointRedemptionAddHandler implements EventHandler {
    private readonly slClient: StreamerSongListClient;

    async handle(rawEvent: TwitchWebhookEvent<any>) {
        const event = rawEvent as TwitchWebhookEvent<PointRedemptionAddEvent>;
        const streamerName = event.event.broadcaster_user_login;
        const slToken = await StreamerSongListDbClient.getToken(streamerName);
        if (!slToken) {
            throw new Error(`Could not get ssl token for ${streamerName}`);
        }

        
    }
}