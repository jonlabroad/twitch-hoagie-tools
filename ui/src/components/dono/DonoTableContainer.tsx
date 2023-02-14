import { Button, CircularProgress, Grid, IconButton } from "@material-ui/core";
import { ArrowLeft, ArrowRight, ShoppingBasket } from "@material-ui/icons";
import { useContext, useEffect, useState } from "react";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import HoagieClient, { DonoData } from "../../service/HoagieClient";
import { StateContext } from "../MainPage";
import { FlexRow } from "../util/FlexBox";
import { DonoTable } from "./DonoTable";

interface DonoTableContainerProps {

}

interface StreamInfo {
    streamId: string
    timestamp: string
}

const eligibleThreshold = 5; // TODO configurable

export const DonoTableContainer = (props: DonoTableContainerProps) => {
    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    useStreamerSongListEvents(stateContext);

    const [loading, setLoading] = useState(false);
    const [streamHistory, setStreamHistory] = useState<StreamInfo[] | undefined>(undefined)
    const [currentStream, setCurrentStream] = useState<StreamInfo | undefined>(undefined)
    const [eligibleDonoData, setEligibleDonoData] = useState<DonoData[]>([]);
    const [notEligibleDonoData, setNotEligibleDonoData] = useState<DonoData[]>([]);

    async function getDonos() {
        if (state.username && state.accessToken && state.streamer && currentStream) {
            setLoading(true)
            const client = new HoagieClient();
            try {
                const data = await client.getDonos(state.username, state.accessToken, state.streamer, currentStream.streamId)

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
    }, [state.username, state.accessToken, state.streamer, currentStream])

    useEffect(() => {
        async function getStreamHistory() {
            if (state.username && state.accessToken && state.streamer) {
                const client = new HoagieClient();
                const data = await client.getStreamHistory(state.username, state.accessToken, state.streamer)
                if (data) {
                    const historyArray = Object.values(data)
                    setStreamHistory(historyArray)
                    setCurrentStream(historyArray[0])
                }
            }
        }
        getStreamHistory()
    }, [state.username, state.accessToken, state.streamer])

    const isLoggedIn = state.isLoggedIn && state.accessToken && state.username;

    const currentStreamIndex = (streamHistory ?? []).findIndex(sh => !!sh.streamId && sh.streamId === currentStream?.streamId)
    //console.log({streamHistory, currentStream, currentStreamIndex})

    const getNextStream = (direction: number) => {
        const nextStream = streamHistory?.[(currentStreamIndex ?? 1000000) + direction]
        if (nextStream) {
            setCurrentStream(nextStream)
        }
    }

    const enableArrow = (direction: number) => {
        if (currentStreamIndex >= 0 && streamHistory) {
            const nextIndex = currentStreamIndex + direction
            console.log({currentStreamIndex, nextIndex})
            return nextIndex >= 0 && nextIndex < streamHistory.length
        }
        return false
    }

    const streamDate = currentStream ? new Date(currentStream.timestamp) : undefined

    return <>
        {!isLoggedIn && <Grid item xs={12}>
            <LoginPrompt />
        </Grid>}
        {isLoggedIn && <Grid item xs={12}>
            <FlexRow alignItems="center">
                <IconButton disabled={!enableArrow(1)} onClick={() => {
                    getNextStream(1)
                }}>
                    <ArrowLeft />
                </IconButton>
                {streamDate && <FlexRow justifyContent="center" style={{minWidth: 160}}>{`${streamDate.toLocaleDateString()} ${streamDate.toLocaleTimeString()}`}</FlexRow>}
                <IconButton disabled={!enableArrow(-1)} onClick={() => {
                    getNextStream(-1)
                }}>
                    <ArrowRight />
                </IconButton>

            </FlexRow>
            <div style={{ marginLeft: 10, marginTop: 10 }}>
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