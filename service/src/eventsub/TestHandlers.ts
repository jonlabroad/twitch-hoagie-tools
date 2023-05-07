import StreamerRaidHandler from "./raids/StreamerRaidHandler";
import { TwitchEventHandlers } from "./TwitchEventHandler";

export const broadcasterLogin = "sashiboom";

export const TestHandlers: TwitchEventHandlers = {
    "channel.raid": new StreamerRaidHandler(broadcasterLogin)
}