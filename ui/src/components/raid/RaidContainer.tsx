import { Accordion, AccordionDetails, AccordionSummary, CircularProgress, Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import { SSL_OP_PKCS1_CHECK_1, SSL_OP_PKCS1_CHECK_2 } from "node:constants";
import React, { useContext, useEffect, useState } from "react";
import { useLiveChannels, useRaidTargets } from "../../hooks/raidTargetHooks";
import TwitchClient from "../../service/TwitchClient";
import { ChannelData, LiveChannelData, StreamData, UserData } from "../../service/TwitchClientTypes";
import StreamSorter from "../../util/StreamSorter";
import { CountupTimer } from "../CountdownTimer";
import { StateContext } from "../MainPage";
import { FlexCol } from "../util/FlexBox";

export interface RaidContainerProps {

}

export const RaidContainer = (props: RaidContainerProps) => {
    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [myFollowed, theirFollowed] = useRaidTargets(state.streamer, state.username, state.accessToken);
    const [liveStreams] = useLiveChannels(state.username, state.accessToken);

    const [liveStreamsToDisplay, setLiveChannelsToDisplay] = useState<Record<string, StreamData>>({});

    useEffect(() => {
        console.log({myFollowed, theirFollowed})
        if (myFollowed && theirFollowed && liveStreams.length > 0) {
            const filtered: Record<string, StreamData> = {};
            liveStreams.filter(c =>
                c.game_name.toLowerCase().includes("music") &&
                (!!myFollowed[c.user_name] || !!theirFollowed[c.user_name])).forEach(c => filtered[c.user_name] = c);
            setLiveChannelsToDisplay(filtered);
        }
    }, [liveStreams, myFollowed, theirFollowed]);

    const [userInfo, setUserInfo] = useState<Record<string, UserData>>({});
    useEffect(() => {
        async function get() {
            if (state.username && state.accessToken) {
                const client = new TwitchClient(state.accessToken);
                const users = await client.getUsers(Object.values(liveStreamsToDisplay).map(c => c.user_name));
                const cInfo: Record<string, UserData> = {};
                users.forEach(s => cInfo[s.display_name] = s);
                setUserInfo(cInfo);
            }
        }
        get();
    }, [liveStreamsToDisplay, state.username, state.accessToken])

    if (state.username && !state.accessToken) {
        return <CircularProgress />
    }

    const sortedChannels = Object.values(liveStreamsToDisplay).sort((c1, c2) => StreamSorter.sort(c1, c2));
    const numChannels = sortedChannels.length;
    console.log({userInfo});
    return <FlexCol>
        <Typography variant="h3">{`Raid Candidates ${numChannels > 0 ? `(${sortedChannels.length})` : ""}`}</Typography>
        <Table size="small">
            <TableBody>
                {sortedChannels.map(stream => (
                    <TableRow>
                        <TableCell>{StreamSorter.getSortRank(stream)}</TableCell>
                        <TableCell><ChannelLink username={stream.user_name}><img style={{ borderRadius: 25, height: 50, width: "auto" }} src={userInfo[stream.user_name]?.profile_image_url} /></ChannelLink></TableCell>
                        <TableCell><Typography variant="subtitle1">{stream.user_name}</Typography></TableCell>
                        <TableCell><ChannelLink username={stream.user_name}><img style={{ height: 90 }} src={stream?.thumbnail_url.replace('{width}', '440').replace('{height}', '248')} /></ChannelLink></TableCell>
                        <TableCell><CountupTimer startDate={new Date(stream.started_at)} /></TableCell>
                        <TableCell>{stream?.viewer_count}</TableCell>
                        <TableCell>{stream.title}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </FlexCol>
}

const ChannelLink = (props: { username: string, children: JSX.Element | JSX.Element[] }) => {
    return <a href={`https://www.twitch.tv/${props.username}`} target="_blank">
        {props.children}
    </a>
}