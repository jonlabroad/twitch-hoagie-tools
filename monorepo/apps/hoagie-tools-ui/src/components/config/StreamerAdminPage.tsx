import { BotConfigModule } from "./modules/BotConfigModule";
import { StreamerSongListConfigModule } from "./modules/StreamerSongListConfigModule";
import { useStreamerName } from "../../hooks/useStreamerName";

export interface StreamerAdminPageProps {}

export const StreamerAdminPage = (props: StreamerAdminPageProps) => {
  useStreamerName();

  return (
    <>
      <BotConfigModule />
      <StreamerSongListConfigModule />
    </>
  );
};
