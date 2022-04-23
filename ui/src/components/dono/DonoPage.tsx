import { useReducer } from "react"
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { StateContext } from "../MainPage";
import { PageHeader } from "../PageHeader";

import { DonoTableContainer } from "../dono/DonoTableContainer";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { useParams } from "react-router";
import { Grid } from "@material-ui/core";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import Config from "../../Config";
import { useSongQueueEval } from "../../hooks/songQueueEval";
import { EvaluatedSongQueue } from "../ssl/EvaluatedSongQueue";

export interface DonoPageProps {
}

export const DonoPage = (props: DonoPageProps) => {
    const { streamer } = useParams() as { streamer: string };

    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
        streamer,
    } as AppState);

    const [evaluations] = useSongQueueEval(appState);

    useSaveLastPath();

    return <>
        <StateContext.Provider value={{
            dispatch: appStateDispatch,
            state: appState,
        }}>
            <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} clientId={Config.clientId}/>
            <Grid container spacing={3}>
                <EvaluatedSongQueue evaluations={evaluations} />
                <DonoTableContainer />
            </Grid>
        </StateContext.Provider>
    </>
}