import { useContext } from "react";
import { BotConfigModule } from "./modules/BotConfigModule";
import { StreamerSongListConfigModule } from "./modules/StreamerSongListConfigModule";
import { ModsModule } from "./modules/ModsModule";
import {
  StateContext,
} from "../context/StateContextProvider";
import { useStreamerName } from "../../hooks/useStreamerName";
import { RaidConfigModule } from "./modules/RaidConfigModule";

export interface StreamerConfigProps {}

export const StreamerConfigPage = (props: StreamerConfigProps) => {
  const {
    state: { streamer, streamerId },
  } = useContext(StateContext);
  useStreamerName();

  return (
    <>
      <ModsModule streamerId={streamerId ?? ""} />
      <RaidConfigModule />
    </>
  );
};
