import ChannelUpdateHandler from "./general/ChannelUpdateHandler";
import PointRedemptionAddHandler from "./thesongery/PointRedemptionAddHandler";
import { TwitchEventHandlers } from "./TwitchEventHandler";

export const TheSongeryHandlers: TwitchEventHandlers = {
    "channel.update": new ChannelUpdateHandler(),
    "channel.channel_points_custom_reward_redemption.add": new PointRedemptionAddHandler()
}