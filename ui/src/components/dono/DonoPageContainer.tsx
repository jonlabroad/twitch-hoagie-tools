import { useContext, useEffect, useReducer } from "react";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { PageHeader } from "../PageHeader";

import { DonoTableContainer } from "../dono/DonoTableContainer";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { Container, Grid } from "@mui/material";
import { EvaluatedSongQueueContainer } from "../ssl/EvaluatedSongQueueContainer";
import { DonoContext } from "./DonoContextProvider";
import { SystemStatusContext } from "../context/SystemStatusContextProvider";
import { ChannelInfoProvider } from "../data/ChannelInfoProvider";

export interface DonoPageContainerProps {}

export const DonoPageContainer = (props: DonoPageContainerProps) => {
  const donoContext = useContext(DonoContext);

  useSaveLastPath();

  const { status, refresh } = useContext(SystemStatusContext);

  return (
    <>
      <Container maxWidth={"xl"}>
        <Grid container spacing={3}>
          <ChannelInfoProvider />
          <EvaluatedSongQueueContainer />
          <DonoTableContainer
            streamHistory={donoContext.selection.streamHistory}
            currentStreams={donoContext.selection.currentStreams}
            isFirstStream={donoContext.selection.isFirst}
            isLastStream={donoContext.selection.isLast}
            getNextStream={donoContext.selection.getNextStream}
          />
        </Grid>
      </Container>
    </>
  );
};
