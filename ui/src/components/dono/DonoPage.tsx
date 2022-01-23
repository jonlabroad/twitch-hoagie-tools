import { useReducer } from "react"
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { StateContext } from "../MainPage";
import { PageHeader } from "../PageHeader";

import { DonoTableContainer } from "../dono/DonoTableContainer";
import { useSaveLastPath } from "../../hooks/LastPathHooks";

import "../../styles/Dono.scss";
import { useParams } from "react-router";

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
            <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} />
            <DonoTableContainer />
        </StateContext.Provider>
    </>
}