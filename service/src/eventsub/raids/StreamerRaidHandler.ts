import RaidDbClient from "../../channelDb/RaidDbClient";
import TwitchClient from "../../twitch/TwitchClient";
import TwitchWebhookEvent from "../../twitch/TwitchWebhook";
import { EventHandler } from "../EventHandler";
import { RaidEvent } from "../events/RaidEvent";

// DEPRECATED
export default class StreamerRaidHandler implements EventHandler {
    broadcasterLogin: string;

    constructor(broadcasterLogin: string) {
        this.broadcasterLogin = broadcasterLogin.toLowerCase();
    }

    async handle(rawEvent: TwitchWebhookEvent<any>) {
        const event = rawEvent as TwitchWebhookEvent<RaidEvent>;
        if (event.event.from_broadcaster_user_login.toLowerCase() === this.broadcasterLogin || event.event.to_broadcaster_user_login.toLowerCase() === this.broadcasterLogin) {
            const client = new RaidDbClient(this.broadcasterLogin);
            await client.writeRaid(event.event);   
        }
    }
}
