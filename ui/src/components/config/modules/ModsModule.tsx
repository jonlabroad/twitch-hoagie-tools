import { Grid, CircularProgress, TextField, Button, Typography, IconButton } from "@material-ui/core";
import { useState, useEffect } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/Link';
import { AppState } from "../../../state/AppState";
import BlockIcon from '@material-ui/icons/Block';

export interface BotConfigModuleProps {
    appState: AppState
    streamerName: string
}

export const ModsModule = (props: BotConfigModuleProps) => {
    const { appState, streamerName } = props;

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
        if (appState.username && appState.accessToken && streamerName) {
            getMods(appState.username, appState.accessToken, streamerName);
        }
    }, [appState.username, appState.accessToken, streamerName])

    const enableButtons = appState.username && appState.accessToken && appState.streamer;

    return (
        <Grid item xs={12}>
            <FlexCol className="mods-config-container">
                <FlexRow alignItems="center">
                    <h2 style={{ marginRight: 20 }}>Mods</h2>
                </FlexRow>
                {mods?.map(mod => (
                    <FlexRow alignItems="center">
                        <Typography style={{ overflow: "ellipsis", width: 130 }}>{mod}</Typography>
                        <IconButton onClick={() => {
                            removeMod(appState!.username!, appState!.accessToken!, appState!.streamer!, mod)
                        }}><BlockIcon fontSize="small" color="primary" /></IconButton>
                    </FlexRow>
                ))}
                <FlexRow alignItems="center">
                    <TextField label="Add Mod" variant="filled" style={{ maxWidth: 300, marginRight: 20 }} value={modName} onChange={(ev) => setModName(ev.target.value)} />
                    <Button style={{ maxWidth: 160, marginRight: 30 }} variant="contained" color={"primary"} disabled={!enableButtons} onClick={() => {
                        if (appState.username && appState.accessToken && appState.streamer && appState.streamer && modName) {
                            addMod(appState.username, appState.accessToken, appState.streamer, modName);
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