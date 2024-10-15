import { RewardConfigPage } from "./RewardConfigPage"
import { RewardEventSubSubscriptionsContainer } from "./RewardEventSubSubscriptionsContainer"
import { useSaveLastPath } from "../../../hooks/LastPathHooks";
import { ChannelInfoProvider } from "../../data/ChannelInfoProvider";
import { EvaluatedSongQueueContainer } from "../../ssl/EvaluatedSongQueueContainer";
import { TwitchUserInfoProvider } from "../../context/TwitchUserInfoProvider";
import { useStreamerName } from "../../../hooks/useStreamerName";

export const RewardConfigPageContainer = () => {
  useSaveLastPath();
  useStreamerName();

  return <>
      <ChannelInfoProvider />
      <TwitchUserInfoProvider>
        <RewardConfigPage />
      </TwitchUserInfoProvider>
  </>
}
