import { Grid, CircularProgress, TextField, Button } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/Link';
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";

export interface StreamerSongListConfigModuleProps {
}

export const StreamerSongListConfigModule = (props: StreamerSongListConfigModuleProps) => {
    const { state: loginState } = useContext(LoginContext);
    const { state: appState } = useContext(StateContext);

    const [sslStatus, setSSLStatus] = useState("");
    const [token, setToken] = useState<string | undefined>(undefined);

    const connected = sslStatus === "CONNECTED";

    async function retrieveConnectionStatus() {
        if (loginState.userId && loginState.accessToken && appState.streamerId) {
            const client = new HoagieClient();
            const status = await client.getSSLStatus(loginState.userId, loginState.accessToken, appState.streamerId);
            setSSLStatus(status);
        }
    }

    async function sendToken(token?: string) {
        if (token && token.length > 0 && loginState.userId && loginState.accessToken && appState.streamerId) {
            const tokenStripped = token.replaceAll('"', "");
            const client = new HoagieClient();
            const response = await client.setSSLToken(tokenStripped, loginState.userId, loginState.accessToken, appState.streamerId);
            retrieveConnectionStatus();
        }
    }

    useEffect(() => {
        retrieveConnectionStatus();
    }, [loginState.userId, loginState.accessToken, appState.streamerId])

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
