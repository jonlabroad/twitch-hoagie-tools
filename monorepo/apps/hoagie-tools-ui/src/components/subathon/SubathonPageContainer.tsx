import { useContext } from "react";

import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { Container, Grid } from "@mui/material";
import { EvaluatedSongQueueContainer } from "../ssl/EvaluatedSongQueueContainer";
import { ChannelInfoProvider } from "../data/ChannelInfoProvider";
import { EventList } from "../ssl/EventList/EventList";
import { TwitchUserInfoProvider } from "../context/TwitchUserInfoProvider";
import { DonoContext } from "../dono/DonoContextProvider";
import { SubathonDonoTableContainer } from "./SubathonDonoTableContainer";

export interface SubathonPageContainerProps {}

export const SubathonPageContainer = (props: SubathonPageContainerProps) => {
  const donoContext = useContext(DonoContext);

  useSaveLastPath();

  return (
    <>
      <Container maxWidth={"xl"}>
        <Grid container spacing={3}>
          <ChannelInfoProvider />
          <EvaluatedSongQueueContainer />
          <TwitchUserInfoProvider>
            <SubathonDonoTableContainer
              streamHistory={donoContext.selection.streamHistory}
              currentStreams={donoContext.selection.currentStreams}
              isFirstStream={donoContext.selection.isFirst}
              isLastStream={donoContext.selection.isLast}
              getNextStream={donoContext.selection.getNextStream}
            />
          </TwitchUserInfoProvider>
          <Grid paddingBottom={30} item xs={12} lg={4}>
            <TwitchUserInfoProvider>
              <EventList />
            </TwitchUserInfoProvider>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
