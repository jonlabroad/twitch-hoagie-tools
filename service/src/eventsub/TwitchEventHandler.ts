import TwitchWebhookEvent from "../twitch/TwitchWebhook";
import { EventHandler } from "./EventHandler";

export type TwitchEventHandlers = Record<string, EventHandler>

export default class TwitchEventhandler {
    private readonly handlers: TwitchEventHandlers[];

    constructor(handlers: TwitchEventHandlers[]) {
        this.handlers = handlers;
    }

    public async handle(event: TwitchWebhookEvent<any>) {
        console.log(`Processing ${event.subscription.type} event`);
        const responses = await Promise.all(this.handlers.map(async handlers => {
            const handler = handlers[event.subscription.type];
            if (handler) {
                const response = await handler.handle(event);
                return response;
            }
        }));

        return responses;
    }
}