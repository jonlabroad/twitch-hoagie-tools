import TwitchWebhookEvent from "../twitch/TwitchWebhook";
import { EventHandler } from "./EventHandler";
import { RaidHandler } from "./raids/RaidHandler";

export type TwitchEventHandlers = Record<string, EventHandler[]>;

export default class TwitchEventhandler {
  private handlers: TwitchEventHandlers;

  constructor() {
    this.handlers = {
      "channel.raid": [new RaidHandler()],
    };
  }

  public async handle(event: TwitchWebhookEvent<any>) {
    console.log(`Processing ${event.subscription.type} event`);
    const handlers = this.handlers[event.subscription.type];
    if (handlers) {
      await Promise.all(handlers.map((handler) => handler.handle(event)));
      return;
    }
  }
}
