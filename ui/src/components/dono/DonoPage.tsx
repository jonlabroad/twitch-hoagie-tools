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
import Config from "../../Config";
import { EvaluatedSongQueueContainer } from "../ssl/EvaluatedSongQueueContainer";

export interface DonoPageProps {
}

export const DonoPage = (props: DonoPageProps) => {
    const { streamer } = useParams() as { streamer: string };

    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
        streamer,
    } as AppState);

    useSaveLastPath();

    return <>
        <StateContext.Provider value={{
            dispatch: appStateDispatch,
            state: appState,
        }}>
            <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} clientId={Config.clientId}/>
            <Grid container spacing={3}>
                {<EvaluatedSongQueueContainer />}
                <DonoTableContainer />
            </Grid>
        </StateContext.Provider>
    </>
}