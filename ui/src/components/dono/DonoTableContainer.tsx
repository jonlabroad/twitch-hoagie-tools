import { Button, CircularProgress, Grid, IconButton } from "@material-ui/core";
import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import { useContext, useEffect } from "react";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import { DonoUtil } from "../../util/DonoUtil";
import { DonoContext, StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { DonoTable } from "./DonoTable";

interface DonoTableContainerProps {
    streamHistory: StreamInfo[] | undefined
    currentStreams: StreamInfo[] | undefined
    isFirstStream: boolean
    isLastStream: boolean
    getNextStream: (dir: number) =>  any
}

export interface StreamInfo {
    streamId: string
    timestamp: string
}

export const DonoTableContainer = (props: DonoTableContainerProps) => {
    const stateContext = useContext(StateContext);
    const donoContext = useContext(DonoContext);
    const { state } = stateContext;
    const { state: donoState, refreshDonos } = donoContext;
    const { donoData, loading } = donoState;
    const { streamHistory, currentStreams, getNextStream, isFirstStream, isLastStream } = props;
    
    const { eligible, notEligible } = DonoUtil.getEligibleDonos(donoData, 5)

    useStreamerSongListEvents(stateContext);

    useEffect(() => {
        function scheduleRefresh() {
            setTimeout(() => {
                console.log("auto refresh")
                refreshDonos()
                const currentStream = currentStreams?.[0]
                if (currentStream) {
                    const streamStartDate = new Date(currentStream.timestamp)
                    const now = Date.now()
                    if (now - streamStartDate.getTime() < 8 * 60 * 60 * 1e3) {
                        scheduleRefresh()
                    }
                }
            }, 120000)
        }
        scheduleRefresh()
    }, [])

    const isLoggedIn = state.isLoggedIn && state.accessToken && state.username;

    const enableArrow = (direction: number) => {
        if (direction < 0) {
            return !isLastStream
        } else {
            return !isFirstStream
        }
    }

    const streamDates = currentStreams ? currentStreams.map(s => new Date(s.timestamp)) : undefined

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
                <FlexCol>
                {streamDates && streamDates.map(streamDate => (
                    <FlexRow justifyContent="center" style={{minWidth: 160}}>{`${streamDate.toLocaleDateString()} ${streamDate.toLocaleTimeString()}`}</FlexRow>
                ))}
                </FlexCol>
                <IconButton disabled={!enableArrow(-1)} onClick={() => {
                    getNextStream(-1)
                }}>
                    <ArrowRight />
                </IconButton>

            </FlexRow>
            <div style={{ marginLeft: 10, marginTop: 10 }}>
                <Button style={{ height: 40, width: 100 }} variant="contained" onClick={() => refreshDonos()} disabled={loading}>{loading ? <CircularProgress size={25} /> : "Refresh"}</Button>
            </div>
            <DonoTable
                eligibleDonoData={eligible ?? []}
                notEligibleDonoData={notEligible ?? []}
                songQueue={state.songQueue}
                songHistory={state.songHistory}
            />
        </Grid>
        }
    </>
}

const LoginPrompt = () => <div>Login to view dono table</div>