import { Grid, CircularProgress, TextField, Button, Typography } from "@material-ui/core";
import { useState, useEffect } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/Link';
import { AppState } from "../../../state/AppState";

export interface BotConfigModuleProps {
    appState: AppState
    streamerName: string
}

export const BotConfigModule = (props: BotConfigModuleProps) => {
    const { appState, streamerName } = props;

    const [token, setToken] = useState<string | undefined>(undefined);

    async function getToken() {
        if (appState.username && appState.accessToken) {
            const client = new HoagieClient();
            const response = await client.getBotToken(appState.username, appState.accessToken, streamerName);
            console.log({response})
            setToken(response?.botToken)
        }
    }

    async function refreshToken() {
        if (appState.username && appState.accessToken) {
            const client = new HoagieClient();
            const response = await client.refreshBotToken(appState.username, appState.accessToken, streamerName)
            setTimeout(() => getToken(), 500)
        }
    }

    useEffect(() => {
        getToken();
    }, [appState.username, appState.accessToken])

    return (
        <Grid item xs={12}>
            <FlexCol className="songlist-config-container">
                <FlexRow alignItems="center">
                    <h2 style={{ marginRight: 20 }}>Chat Bot</h2>
                </FlexRow>
                <Typography>Hoagie Bot API Key (WARNING: all commands must be updated on refresh!)</Typography>
                <FlexRow alignItems="center">
                    <Typography style={{ marginRight: 10 }}>{token ?? ""}</Typography>
                    <Button color="primary" variant="contained" onClick={() => refreshToken()} >{"Refresh Token"}</Button>
                </FlexRow>
            </FlexCol>
        </Grid>
    );
}