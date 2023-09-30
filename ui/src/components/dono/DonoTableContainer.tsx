import { Button, CircularProgress, Grid, Icon, IconButton, Tooltip } from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { useContext, useEffect, useRef } from "react";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import { DonoUtil } from "../../util/DonoUtil";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { DonoTable } from "./DonoTable";
import { StateContext } from "../context/StateContextProvider";
import { DonoContext } from "./DonoContextProvider";
import { LoginContext } from "../context/LoginContextProvider";
import { useHoagieSockets } from "../../hooks/hoagieSocketHooks";
import UpdateIcon from '@mui/icons-material/Update';
import { ServerStatus } from "../status/ServerStatus";
import { StreamLiveIcon } from "../icon/StreamLive";

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
    const { state: loginState } = useContext(LoginContext);
    const { state: donoState, refreshDonos } = donoContext;
    const { donoData, loading } = donoState;
    const { streamHistory, currentStreams, getNextStream, isFirstStream, isLastStream } = props;
    const currentStreamsRef = useRef(currentStreams);
    
    const [hoagieSockets, isHoagieSocketConnected] = useHoagieSockets((msg: any) => {
        console.log({refreshDonos: msg})
        setTimeout(() => refreshDonos(currentStreamsRef.current ?? []), 1000);
    });

    const { eligible, notEligible } = DonoUtil.getEligibleDonos(donoData, 5)

    useStreamerSongListEvents(stateContext);

    useEffect(() => {
        currentStreamsRef.current = currentStreams;
    }, [currentStreams])

    const isLoggedIn = loginState.isLoggedIn && loginState.accessToken && loginState.username;

    const enableArrow = (direction: number) => {
        if (direction < 0) {
            return !isLastStream
        } else {
            return !isFirstStream
        }
    }

    const streamDates = currentStreams ? currentStreams.map(s => new Date(s.timestamp)) : undefined
    const liveStreamId = state.streamerData?.streamData?.id ?? "";
    const isLive = (currentStreams ?? []).map(s => s.streamId).includes(liveStreamId) && state.streamerData?.streamData?.type === "live";

    return <>
        {!isLoggedIn && <Grid item xs={12}>
            <LoginPrompt />
        </Grid>}
        {isLoggedIn && <Grid item xs={12}>
            <FlexRow alignItems="center">
                <IconButton
                    disabled={!enableArrow(1)}
                    onClick={() => {
                        getNextStream(1)
                    }}
                    size="large">
                    <ArrowLeft />
                </IconButton>
                <FlexCol>
                {streamDates && streamDates.map(streamDate => (
                    <FlexRow key={streamDate.toISOString()} justifyContent="center" style={{minWidth: 160}}>{`${streamDate.toLocaleDateString()} ${streamDate.toLocaleTimeString()}`}</FlexRow>
                ))}
                </FlexCol>
                <IconButton
                    disabled={!enableArrow(-1)}
                    onClick={() => {
                        getNextStream(-1)
                    }}
                    size="large">
                    <ArrowRight />
                </IconButton>
                <StreamLiveIcon isLive={isLive} />
                <ServerStatus />
            </FlexRow>
            <FlexRow alignItems="center" style={{ marginLeft: 10, marginTop: 10 }}>
                <Button
                    style={{ height: 40, width: 100, marginRight: 10 }}
                    variant="contained"
                    onClick={() => refreshDonos(currentStreamsRef.current ?? [])}
                    disabled={loading}>
                    {loading ? <CircularProgress size={25} /> : "Refresh"}
                </Button>
                <Tooltip title={isHoagieSocketConnected ? "Auto-updating" : "No connection :("}>
                    <UpdateIcon color={isHoagieSocketConnected ? "primary" : "disabled"}/>
                </Tooltip>
            </FlexRow>
            <DonoTable
                eligibleDonoData={eligible ?? []}
                notEligibleDonoData={notEligible ?? []}
                songQueue={state.songQueue}
                songHistory={state.songHistory}
            />
        </Grid>
        }
    </>;
}

const LoginPrompt = () => <div>Login to view dono table</div>