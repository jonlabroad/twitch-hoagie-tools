import { AppBar, Button, Link, Tab, Tabs, Toolbar, Typography } from "@material-ui/core"
import React, { createContext, useEffect, useReducer, useRef, useState } from "react"
import { useParams } from "react-router";
import AlertGenerator, { AlertContextType } from "../alerts/AlertGenerator";
import { useTwitchChatClient } from "../hooks/chatClientHooks";
import { useLogin } from "../hooks/loginHooks";
import TwitchClient from "../service/TwitchClient";
import { AppState, defaultAppState, StateContextType } from "../state/AppState";
import { appStateReducer, LoginAction } from "../state/AppStateReducer";
import CacheManager from "../util/CacheManager";
import LocalStorage from "../util/LocalStorage";
import { AlertContainer } from "./alerts/AlertContainer";
import { EventsContainer } from "./events/EventsContainer";

export const clientId = "2tkbhgbkk81ylt5o22iqjk9c0sorcg";
//const scopes = "chat:read chat:edit"
const scopes = "chat:read"

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
    const twitchClient = useRef<TwitchClient | undefined>(undefined);
    const alertGenerator = useRef<AlertGenerator | undefined>(undefined);
    const caches = useRef(new CacheManager());

    const [] = useLogin((username: string | undefined, accessToken: string, isLoggedIn: boolean) => {
        if (username) {
            appStateDispatch({
                type: "login",
                username,
                accessToken,
                isLoggedIn,
            } as LoginAction);
        }
    });

    useEffect(() => {
        if (appState.accessToken && !twitchClient.current) {
            const client = new TwitchClient(appState.accessToken, caches.current);
            twitchClient.current = client;
            alertGenerator.current = new AlertGenerator(client);
        }
    }, [appState.accessToken])

    return <React.Fragment>
        <AlertContext.Provider value={{
            alertGenerator: alertGenerator.current
        }}>
            <StateContext.Provider value={{
                dispatch: appStateDispatch,
                state: appState,
            }}>
                <AppBar style={{
                    backgroundColor: "#3C474B",
                    color: "#dbdbf8"
                }} position="static">
                    <Toolbar variant="dense">
                        <Typography variant="h6" style={{ marginRight: "20px" }}>
                            Hoagie Tools
                </Typography>
                        {appState.isLoggedIn ? <div>{appState.username}</div> :
                            <Button
                                variant="contained"
                                color="secondary"
                                href={`https://id.twitch.tv/oauth2/authorize?scope=${scopes}&client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token`}
                            >
                                Login
                    </Button>}
                    </Toolbar>
                </AppBar>
                <AlertContainer />
                <EventsContainer />
            </StateContext.Provider>
        </AlertContext.Provider>
    </React.Fragment>
}