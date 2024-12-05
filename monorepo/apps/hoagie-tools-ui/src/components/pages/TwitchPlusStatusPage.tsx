import { useSaveLastPath } from "../../hooks/LastPathHooks";
import { useStreamerName } from "../../hooks/useStreamerName";
import { TwitchUserInfoProvider } from "../context/TwitchUserInfoProvider";
import { TwitchPlusStatus } from "../twitchplus/TwitchPlusStatus";

interface IProps {}

export const TwitchPlusStatusPage = (props: IProps) => {
  useStreamerName();
  useSaveLastPath();

  return (
    <TwitchUserInfoProvider>
      <TwitchPlusStatus />
    </TwitchUserInfoProvider>
  );
};
