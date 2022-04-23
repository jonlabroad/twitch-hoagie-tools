import { AppBar, Button, Grid, Hidden, Link, Tab, Tabs, Toolbar, Typography } from "@material-ui/core"
import React, { createContext, useEffect, useReducer, useRef, useState } from "react"
import { useParams } from "react-router";
import AlertGenerator, { AlertContextType } from "../alerts/AlertGenerator";
import Config from "../Config";
import { useTwitchChatClient } from "../hooks/chatClientHooks";
import { useChatEvaluator } from "../hooks/chatModHooks";
import { useLogin } from "../hooks/loginHooks";
import TwitchClient from "../service/TwitchClient";
import { AppState, defaultAppState, StateContextType } from "../state/AppState";
import { appStateReducer, LoginAction } from "../state/AppStateReducer";
import CacheManager from "../util/CacheManager";
import LocalStorage from "../util/LocalStorage";
import { EmbeddedVideo } from "../video/EmbeddedVideo";
import { AlertContainer } from "./alerts/AlertContainer";
import { ChannelHeader } from "./ChannelHeader";
import { ChatParticipants } from "./chat/ChatParticipants";
import { EmbeddedChat } from "./chat/EmbeddedChat";
import { ChatMessage } from "./chat/SimpleChatDisplay";
import { ChatEvaluatorContainer } from "./chatEval/ChatEvaluatorContainer";
import { EventsContainer } from "./events/EventsContainer";
import { PageHeader } from "./PageHeader";
import { RaidContainer } from "./raid/RaidContainer";
import { SongQueue } from "./ssl/SongQueue";
import { StreamerLinks } from "./StreamerLinks";
import { FlexRow } from "./util/FlexBox";

export interface MainPageProps {

}

export const StateContext = createContext<StateContextType>({
    dispatch: undefined,
    state: defaultAppState,
});

export const AlertContext = createContext<AlertContextType>({
    alertGenerator: undefined,
})

export const MainPage = (props: MainPageProps) => {
    const { streamer } = useParams() as { streamer: string };

    const rawPersistedState = LocalStorage.get(`appState_${streamer}`);
    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...(rawPersistedState ? JSON.parse(rawPersistedState) : defaultAppState),
        streamer,
    } as AppState);

    const chatClient = useTwitchChatClient(appState, appStateDispatch);

    // TODO move this to a shared hook!@!!!!!!
    const [lastMessage, setLastMessage] = useState<ChatMessage | undefined>(undefined);
    useEffect(() => {
        if (appState.chat.messages.length > 0) {
            setLastMessage(appState.chat.messages[appState.chat.messages.length - 1]);
        }
    }, [appState.chat.messages]);

    const twitchClient = useRef<TwitchClient | undefined>(undefined);
    const alertGenerator = useRef<AlertGenerator | undefined>(undefined);
    const caches = useRef(new CacheManager());

    useEffect(() => {
        if (appState.accessToken && !twitchClient.current) {
            const client = new TwitchClient(appState.accessToken, caches.current);
            twitchClient.current = client;
            alertGenerator.current = new AlertGenerator(client);
        }
    }, [appState.accessToken]);

    useEffect(() => {
        const path = window.location.pathname;
        LocalStorage.set("lastPath", { path });
    }, []);

    return <React.Fragment>
        <AlertContext.Provider value={{
            alertGenerator: alertGenerator.current
        }}>
            <StateContext.Provider value={{
                dispatch: appStateDispatch,
                state: appState,
            }}>
                <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={Config.scopes} clientId={Config.clientId} />
                <div style={{ margin: 12 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <ChannelHeader />
                        </Grid>
                        <Grid item xs={3} >
                        </Grid>
                        <Grid item xs={3} >
                        </Grid>
                        <Grid item xs={1} >
                            <StreamerLinks />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <AlertContainer />
                        <Grid item xs={12} md={6}>
                            <SongQueue />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <RaidContainer />
                        </Grid>
                    </Grid>
                </div>
                <EventsContainer />
            </StateContext.Provider>
        </AlertContext.Provider>
    </React.Fragment>
}