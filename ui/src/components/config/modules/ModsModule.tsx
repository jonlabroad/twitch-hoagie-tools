import { Grid, TextField, Button, Typography, IconButton } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import BlockIcon from '@mui/icons-material/Block';
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";

export interface BotConfigModuleProps {
    streamerName: string
}

export const ModsModule = (props: BotConfigModuleProps) => {
    const { streamerName } = props;
    const { state } = useContext(StateContext)

    const loginContext = useContext(LoginContext);
    const { state: loginState } = loginContext;

    const [mods, setMods] = useState<string[]>([])
    const [modName, setModName] = useState<string>("")

    async function getMods(username: string, accessToken: string, streamerName: string) {
        const client = new HoagieClient()
        const mods = await client.getMods(username, accessToken, streamerName)
        console.log({mods})
        setMods(mods?.mods)
    }

    async function addMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const client = new HoagieClient()
        console.log({username, accessToken, streamerName, modName})
        await client.addMod(username, accessToken, streamerName, modName)
        setTimeout(() => getMods(username, accessToken, streamerName), 1000)
    }

    async function removeMod(username: string, accessToken: string, streamerName: string, modName: string) {
        const client = new HoagieClient()
        await client.removeMod(username, accessToken, streamerName, modName)
        setTimeout(() => getMods(username, accessToken, streamerName), 1000)
    }

    useEffect(() => {
        if (loginState.username && loginState.accessToken && streamerName) {
            getMods(loginState.username, loginState.accessToken, streamerName);
        }
    }, [loginState.username, loginState.accessToken, streamerName])

    const enableButtons = loginState.username && loginState.accessToken && state.streamer;

    return (
        <Grid item xs={12}>
            <FlexCol className="mods-config-container">
                <FlexRow alignItems="center">
                    <h2 style={{ marginRight: 20 }}>Mods</h2>
                </FlexRow>
                {mods?.map(mod => (
                    <FlexRow alignItems="center">
                        <Typography style={{ overflow: "ellipsis", width: 130 }}>{mod}</Typography>
                        <IconButton
                            onClick={() => {
                                removeMod(loginState!.username!, loginState!.accessToken!, state!.streamer!, mod)
                            }}
                            size="large"><BlockIcon fontSize="small" color="primary" /></IconButton>
                    </FlexRow>
                ))}
                <FlexRow alignItems="center">
                    <TextField label="Add Mod" variant="filled" style={{ maxWidth: 300, marginRight: 20 }} value={modName} onChange={(ev) => setModName(ev.target.value)} />
                    <Button style={{ maxWidth: 160, marginRight: 30 }} variant="contained" color={"primary"} disabled={!enableButtons || !modName} onClick={() => {
                        if (loginState.username && loginState.accessToken && state.streamer && state.streamer && modName.length > 0) {
                            addMod(loginState.username, loginState.accessToken, state.streamer, modName);
                            setModName("");
                        }
                    }}>
                        Add
                    </Button>
                </FlexRow>
            </FlexCol>
        </Grid>
    );
}