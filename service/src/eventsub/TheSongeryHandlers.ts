import StreamerRaidHandler from "./raids/StreamerRaidHandler";
import { TwitchEventHandlers } from "./TwitchEventHandler";

const broadcasterLogin = "thesongery";

export const TheSongeryHandlers: TwitchEventHandlers = {
    "channel.raid": new StreamerRaidHandler(broadcasterLogin)
}
