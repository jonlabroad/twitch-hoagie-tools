import { useContext, useReducer } from "react";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { PageHeader } from "../PageHeader";

import { DonoTableContainer } from "../dono/DonoTableContainer";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { Container, Grid } from "@mui/material";
import { EvaluatedSongQueueContainer } from "../ssl/EvaluatedSongQueueContainer";
import {
  StateContext,
} from "../context/StateContextProvider";
import { DonoContext, DonoContextProvider } from "./DonoContextProvider";

export interface DonoPageContainerProps {}

export const DonoPageContainer = (props: DonoPageContainerProps) => {
  const donoContext = useContext(DonoContext);

  useSaveLastPath();

  return (
    <>
      <Container maxWidth={false}>
        <Grid container spacing={3}>
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
