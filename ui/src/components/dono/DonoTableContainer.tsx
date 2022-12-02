import { Button, CircularProgress, Grid } from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import HoagieClient, { DonoData } from "../../service/HoagieClient";
import { StateContext } from "../MainPage";
import { DonoTable } from "./DonoTable";

interface DonoTableContainerProps {

}

const eligibleThreshold = 5; // TODO configurable

export const DonoTableContainer = (props: DonoTableContainerProps) => {
    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    useStreamerSongListEvents(stateContext);

    const [loading, setLoading] = useState(false);
    const [eligibleDonoData, setEligibleDonoData] = useState<DonoData[]>([]);
    const [notEligibleDonoData, setNotEligibleDonoData] = useState<DonoData[]>([]);

    async function getDonos() {
        if (state.username && state.accessToken && state.streamer) {
            setLoading(true)
            const client = new HoagieClient();
            try {
                const data = await client.getDonos(state.username, state.accessToken, state.streamer)

                const eligibleDonos = data.donos?.filter(dono => dono.value >= eligibleThreshold) ?? [];
                const notEligible = data.donos?.filter(dono => dono.value < eligibleThreshold) ?? [];
                setEligibleDonoData(eligibleDonos);
                setNotEligibleDonoData(notEligible);
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        getDonos();
    }, [state.username, state.accessToken, state.streamer])

    const isLoggedIn = state.isLoggedIn && state.accessToken && state.username;

    return <>
        {!isLoggedIn && <Grid item xs={12}>
            <LoginPrompt />
        </Grid>}
        {isLoggedIn && <Grid item xs={12}>
            <div style={{marginLeft: 10, marginTop: 10}}>
                <Button style={{ height: 40, width: 100 }} variant="contained" onClick={() => getDonos()} disabled={loading}>{loading ? <CircularProgress size={25} /> : "Refresh"}</Button>
            </div>
            <DonoTable
                eligibleDonoData={eligibleDonoData}
                notEligibleDonoData={notEligibleDonoData}
                songQueue={state.songQueue}
                songHistory={state.songHistory}
            />
        </Grid>
        }
    </>
}

const LoginPrompt = () => <div>Login to view dono table</div>