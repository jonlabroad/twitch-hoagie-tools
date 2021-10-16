import TwitchWebhookEvent from "../twitch/TwitchWebhook";

export interface EventHandler {
    handle(event: TwitchWebhookEvent<any>): any;
}