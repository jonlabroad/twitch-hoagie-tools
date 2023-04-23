import { Grid, Button, Typography } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";

export interface BotConfigModuleProps {
    streamerName: string
}

export const BotConfigModule = (props: BotConfigModuleProps) => {
    const { streamerName } = props;
    
    const loginContext = useContext(LoginContext);
    const { state: loginState } = loginContext;

    const [token, setToken] = useState<string | undefined>(undefined);

    async function getToken() {
        if (loginState.username && loginState.accessToken) {
            const client = new HoagieClient();
            const response = await client.getBotToken(loginState.username, loginState.accessToken, streamerName);
            setToken(response?.botToken)
        }
    }

    async function refreshToken() {
        if (loginState.username && loginState.accessToken) {
            const client = new HoagieClient();
            const response = await client.refreshBotToken(loginState.username, loginState.accessToken, streamerName)
            setTimeout(() => getToken(), 500)
        }
    }

    useEffect(() => {
        getToken();
    }, [loginState.username, loginState.accessToken])

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