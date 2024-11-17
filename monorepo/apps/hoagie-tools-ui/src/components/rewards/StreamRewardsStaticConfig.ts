import { CreateSubscriptionInput } from "@hoagie/service-clients"

export class StreamRewardsStaticConfig {
  public static readonly EventSubSubscriptionDefinitions = (userId: string, broadcasterId: string): CreateSubscriptionInput[] => {
    return [
      {
        type: 'channel.chat.notification',
        userId: userId,
        condition: {
          user_id: userId,
          broadcaster_user_id: broadcasterId
        }
      },
      {
        type: 'channel.chat.message',
        userId: userId,
        condition: {
          user_id: userId,
          broadcaster_user_id: broadcasterId
        }
      },
      {
        type: 'channel.channel_points_custom_reward_redemption.add',
        userId: userId,
        condition: {
          broadcaster_user_id: broadcasterId,
          //"reward_id": "92af127c-7326-4483-a52b-b0da0be61c01" // optional; gets notifications for a specific reward
        }
      }
    ]
  }
}
