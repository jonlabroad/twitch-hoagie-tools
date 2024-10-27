import { streamRewardsConnectionConfig } from '../connection/ConnectionConfig';

interface IProps {}

export const RewardsConfigDashboard = (props: IProps) => {
  const streamRewardsScopeConfig = streamRewardsConnectionConfig;

  // Rewards requirements:
  // * Bot can chat in channel
  // * Authorization grant token exist for the streamer
  //    * Has the correct scopes: channel:bot, channel:manage:redemptions (can this be changed to channel:read:redemptions?)
  //    * See streamRewardsScopeConfig for updated list
  // * Twitch eventsub subscriptions exist (these are currently subbed by virtue of me being a mod on the channel):
  //    * channel.chat.notification
  //    * channel.chat.message
  //    * channel.channel_points_custom_reward_redemption.add

  return (
    <div>
      <h1>Rewards Config Dashboard</h1>
    </div>
  );
};
