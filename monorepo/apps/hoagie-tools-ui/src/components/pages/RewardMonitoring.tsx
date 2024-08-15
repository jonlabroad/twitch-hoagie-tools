import { TwitchUserInfoProvider } from "../context/TwitchUserInfoProvider"
import { RewardsStreamerDashboard } from "../rewards/RewardsStreamerDashboard"

export const RewardMonitoring = () => {
  return (
    <TwitchUserInfoProvider>
      <RewardsStreamerDashboard />
    </TwitchUserInfoProvider>
  )
}
