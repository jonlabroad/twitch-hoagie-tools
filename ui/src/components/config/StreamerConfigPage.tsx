import { useContext, useReducer } from "react";
import { useParams } from "react-router";
import Config from "../../Config";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { PageHeader } from "../PageHeader";
import { BotConfigModule } from "./modules/BotConfigModule";
import { StreamerSongListConfigModule } from "./modules/StreamerSongListConfigModule";
import { ModsModule } from "./modules/ModsModule";
import {
  StateContext,
  StateContextProvider,
} from "../context/StateContextProvider";
import { useStreamerName } from "../../hooks/useStreamerName";

export interface StreamerConfigProps {}

export const StreamerConfigPage = (props: StreamerConfigProps) => {
  const {
    state: { streamer },
  } = useContext(StateContext);
  useStreamerName();

  return (
    <>
      <BotConfigModule streamerName={streamer ?? ""} />
      <StreamerSongListConfigModule streamerName={streamer ?? ""} />
      <ModsModule streamerName={streamer ?? ""} />
    </>
  );
};
