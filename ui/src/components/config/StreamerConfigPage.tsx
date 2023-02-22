import { useReducer } from "react";
import { useParams } from "react-router";
import Config from "../../Config";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { PageHeader } from "../PageHeader"
import { BotConfigModule } from "./modules/BotConfigModule";
import { StreamerSongListConfigModule } from "./modules/StreamerSongListConfigModule"

export interface StreamerConfigProps {

}

export const StreamerConfigPage = (props: StreamerConfigProps) => {
    const { streamer } = useParams() as { streamer: string };

    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
        streamer,
    } as AppState);

    return <>
        <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} clientId={Config.clientId}/>
        <BotConfigModule appState={appState} streamerName={streamer} />
        <StreamerSongListConfigModule appState={appState} streamerName={streamer}/>
    </>
}