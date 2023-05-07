import RaidDbClient from "../../channelDb/RaidDbClient";
import TwitchWebhookEvent from "../../twitch/TwitchWebhook";
import { EventHandler } from "../EventHandler";
import { RaidEvent } from "../events/RaidEvent";

export class RaidHandler implements EventHandler {
  constructor() {}

  async handle(rawEvent: TwitchWebhookEvent<any>) {
    const event = rawEvent as TwitchWebhookEvent<RaidEvent>;
    const relevantStreamerIds = [
      event.subscription.condition.from_broadcaster_user_id.toLowerCase(),
      event.subscription.condition.to_broadcaster_user_id.toLowerCase(),
    ].filter((s) => !!s);

    await Promise.all(
      relevantStreamerIds.map(async (streamerId) => {
        const client = new RaidDbClient(streamerId);
        await client.writeRaid(event.event);
      })
    );
  }
}
