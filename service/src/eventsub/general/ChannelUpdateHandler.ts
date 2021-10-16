import TwitchWebhookEvent from "../../twitch/TwitchWebhook";
import { EventHandler } from "../EventHandler";

export default class ChannelUpdateHandler implements EventHandler {
    handle(event: TwitchWebhookEvent<any>) {
        console.log(`Received channel update event`);
        console.log({ event });
    }
}