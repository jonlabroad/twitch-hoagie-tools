import { Grid, TextField, Button, Typography, IconButton } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import HoagieClient from "../../../service/HoagieClient";
import { FlexCol, FlexRow } from "../../util/FlexBox";
import BlockIcon from '@mui/icons-material/Block';
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";

export interface BotConfigModuleProps {
    streamerId: string
}

export const ModsModule = (props: BotConfigModuleProps) => {
    const { streamerId } = props;
    const { state } = useContext(StateContext)

    const loginContext = useContext(LoginContext);
    const { state: loginState } = loginContext;

    const [mods, setMods] = useState<string[]>([])
    const [modId, setModId] = useState<string>("")

    async function getMods(userId: string, accessToken: string, streamerId: string) {
        const client = new HoagieClient()
        const mods = await client.getMods(userId, accessToken, streamerId)
        console.log({mods})
        setMods(mods?.mods)
    }

    async function addMod(userId: string, accessToken: string, streamerId: string, modId: string) {
        const client = new HoagieClient()
        console.log({userId, accessToken, streamerId, modId})
        await client.addMod(userId, accessToken, streamerId, modId)
        setTimeout(() => getMods(userId, accessToken, streamerId), 1000)
    }

    async function removeMod(userId: string, accessToken: string, streamerId: string, modId: string) {
        const client = new HoagieClient()
        await client.removeMod(userId, accessToken, streamerId, modId)
        setTimeout(() => getMods(userId, accessToken, streamerId), 1000)
    }

    useEffect(() => {
        if (loginState.userId && loginState.accessToken && streamerId) {
            getMods(loginState.userId, loginState.accessToken, streamerId);
        }
    }, [loginState.userId, loginState.accessToken, streamerId])

    const enableButtons = loginState.userId && loginState.accessToken && state.streamerId;

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
                                removeMod(loginState!.userId!, loginState!.accessToken!, state!.streamerId!, mod)
                            }}
                            size="large"><BlockIcon fontSize="small" color="primary" /></IconButton>
                    </FlexRow>
                ))}
                <FlexRow alignItems="center">
                    <TextField label="Add Mod" variant="filled" style={{ maxWidth: 300, marginRight: 20 }} value={modId} onChange={(ev) => setModId(ev.target.value)} />
                    <Button style={{ maxWidth: 160, marginRight: 30 }} variant="contained" color={"primary"} disabled={!enableButtons || !modId} onClick={() => {
                        if (loginState.userId && loginState.accessToken && state.streamerId && modId.length > 0) {
                            addMod(loginState.userId, loginState.accessToken, state.streamerId, modId);
                            setModId("");
                        }
                    }}>
                        Add
                    </Button>
                </FlexRow>
            </FlexCol>
        </Grid>
    );
}
