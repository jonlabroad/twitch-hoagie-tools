import { useReducer } from "react"
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { DonoContext, StateContext } from "../MainPage";
import { PageHeader } from "../PageHeader";

import { DonoTableContainer } from "../dono/DonoTableContainer";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { useParams } from "react-router";
import { Container, Grid } from "@material-ui/core";
import Config from "../../Config";
import { EvaluatedSongQueueContainer } from "../ssl/EvaluatedSongQueueContainer";
import { useDonoData } from "../../hooks/donoDataHooks";
import { useStreamHistory } from "../../hooks/streamHistoryHooks";
import { useStreamSelection } from "../../hooks/useStreamSelection";

export interface DonoPageProps {
}

export const DonoPage = (props: DonoPageProps) => {
    const { streamer } = useParams() as { streamer: string };

    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
        streamer,
    } as AppState);

    const [streamHistory] = useStreamHistory(appState)
    const [currentStreams, getNextStream, isFirst, isLast] = useStreamSelection(appState, streamHistory)
    const [donoState, donoDispatch, refreshDonos] = useDonoData(appState, currentStreams)

    useSaveLastPath();

    return <>
        <StateContext.Provider value={{
            dispatch: appStateDispatch,
            state: appState,
        }}>
            <DonoContext.Provider value={{
                dispatch: donoDispatch,
                state: donoState,
                refreshDonos: refreshDonos,
            }}>
                <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} clientId={Config.clientId} />
                <Container maxWidth={false}>
                    <Grid container spacing={3}>
                        <EvaluatedSongQueueContainer />
                        <DonoTableContainer
                            streamHistory={streamHistory}
                            currentStreams={currentStreams}
                            isFirstStream={isFirst}
                            isLastStream={isLast}
                            getNextStream={getNextStream}
                        />
                    </Grid>
                </Container>
            </DonoContext.Provider>
        </StateContext.Provider>
    </>
}