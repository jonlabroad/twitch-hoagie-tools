import { RaidHandler } from "./raids/RaidHandler";
import { TwitchEventHandlers } from "./TwitchEventHandler";

export const broadcasterLogin = "sashiboom";

export const TestHandlers: TwitchEventHandlers = {
    "channel.raid": [new RaidHandler()],
}