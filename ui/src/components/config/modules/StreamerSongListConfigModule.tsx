import { Grid, CircularProgress, TextField, Button } from "@material-ui/core";
import { useState, useEffect } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/Link';
import { AppState } from "../../../state/AppState";

export interface StreamerSongListConfigModuleProps {
    appState: AppState
    streamerName: string
}

export const StreamerSongListConfigModule = (props: StreamerSongListConfigModuleProps) => {
    const { appState, streamerName } = props;

    const [sslStatus, setSSLStatus] = useState("");
    const [token, setToken] = useState<string | undefined>(undefined);

    const connected = sslStatus === "CONNECTED";

    async function retrieveConnectionStatus() {
        if (appState.username && appState.accessToken) {
            const client = new HoagieClient();
            const status = await client.getSSLStatus(appState.username, appState.accessToken, streamerName);
            setSSLStatus(status);
        }
    }

    async function sendToken(token?: string) {
        if (token && token.length > 0 && appState.username && appState.accessToken) {
            const tokenStripped = token.replaceAll('"', "");
            const client = new HoagieClient();
            const response = await client.setSSLToken(tokenStripped, appState.username, appState.accessToken, streamerName);
            retrieveConnectionStatus();
        }
    }

    useEffect(() => {
        retrieveConnectionStatus();
    }, [appState.username, appState.accessToken])

    return (
        <Grid item xs={12}>
            <FlexCol className="songlist-config-container">
                <FlexRow alignItems="center">
                    <h2 style={{ marginRight: 20 }}>Streamer Song List</h2>
                    {!sslStatus && <CircularProgress size={20} />}
                    {sslStatus && connected && <LinkIcon style={{ color: "green", marginRight: 10 }} />}
                    {sslStatus && !connected && <LinkOffIcon style={{ color: "red", marginRight: 10 }} />}
                    <div style={{ color: sslStatus === "CONNECTED" ? "green" : "red" }}>{sslStatus}</div>
                </FlexRow>

                <FlexRow alignItems="center">
                    <TextField label="Auth Token" variant="filled" style={{ maxWidth: 300, marginRight: 20 }} onChange={(ev) => setToken(ev.target.value)} />
                    <Button style={{ maxWidth: 160, marginRight: 30 }} variant="contained" color={connected ? "primary" : "secondary"} onClick={() => {
                        sendToken(token);
                        setSSLStatus("");
                    }}>
                        {sslStatus === "CONNECTED" ? "Refresh Token" : "Connect"}
                    </Button>
                </FlexRow>
            </FlexCol>
        </Grid>
    );
}