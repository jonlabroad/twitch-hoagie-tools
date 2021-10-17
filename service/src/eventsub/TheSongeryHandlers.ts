import RaidHandler from "./raids/RaidHandler";
import { TwitchEventHandlers } from "./TwitchEventHandler";

const broadcasterLogin = "thesongery";

export const TheSongeryHandlers: TwitchEventHandlers = {
    "channel.raid": new RaidHandler(broadcasterLogin)
}