import { useContext } from "react";
import { BotConfigModule } from "./modules/BotConfigModule";
import { StreamerSongListConfigModule } from "./modules/StreamerSongListConfigModule";
import { ModsModule } from "./modules/ModsModule";
import {
  StateContext,
} from "../context/StateContextProvider";
import { useStreamerName } from "../../hooks/useStreamerName";
import { ManageEventSub } from "../admin/ManageEventSub";

export interface StreamerAdminPageProps {}

export const StreamerAdminPage = (props: StreamerAdminPageProps) => {
  const {
    state: { streamer },
  } = useContext(StateContext);
  useStreamerName();

  return (
    <>
      <BotConfigModule streamerName={streamer ?? ""} />
      <StreamerSongListConfigModule streamerName={streamer ?? ""} />
    </>
  );
};
