import { Grid } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import Config from "../../Config";
import { useSaveLastPath } from "../../hooks/LastPathHooks";
import HoagieClient, { AdminData } from "../../service/HoagieClient";
import { AppState, defaultAppState } from "../../state/AppState";
import { appStateReducer } from "../../state/AppStateReducer";
import { StateContext } from "../MainPage";
import { PageHeader } from "../PageHeader";
import { ChatTokenContainer } from "./ChatTokenContainer";
import { StreamerListContainer } from "./StreamerListContainer";

interface AdminPageProps {

}

export const AdminPage = (props: AdminPageProps) => {
    const [appState, appStateDispatch] = useReducer(appStateReducer, {
        ...defaultAppState,
    } as AppState);

    useSaveLastPath();

    const [adminData, setAdminData] = useState<AdminData | undefined>(undefined);

    async function getAdminConfig() {
        if (appState.username && appState.accessToken) {
            const client = new HoagieClient();
            const data = await client.getAdminConfig(appState.username, appState.accessToken);
            setAdminData(data);
        }
    }

    useEffect(() => {
        getAdminConfig();
    }, [appState.username, appState.accessToken]);

    return <>
        <StateContext.Provider value={{
            dispatch: appStateDispatch,
            state: appState,
        }}>
            <PageHeader appState={appState} appStateDispatch={appStateDispatch} scopes={""} clientId={Config.clientId}/>
            <Grid container spacing={3}>
                <Grid item style={{margin: 10}} xs={12}>
                    <StreamerListContainer streamers={adminData?.streamers ?? []} onChange={() => getAdminConfig()} />
                </Grid>
                <Grid item style={{margin: 10}} xs={12}>
                    <ChatTokenContainer config={adminData} onChange={() => getAdminConfig()} />
                </Grid>
            </Grid>
        </StateContext.Provider>
    </>
}