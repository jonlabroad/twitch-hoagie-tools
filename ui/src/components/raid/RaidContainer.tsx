import { CircularProgress, Hidden, Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useLiveChannels, useRaidTargets } from "../../hooks/raidTargetHooks";
import HoagieClient from "../../service/HoagieClient";
import TwitchClient from "../../service/TwitchClient";
import { StreamData, UserData } from "../../service/TwitchClientTypes";
import StreamSorter from "../../util/StreamSorter";
import { CountupTimer } from "../CountdownTimer";
import { StateContext } from "../MainPage";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { RaidEvent } from "./RaidEvent";
import { RaidHistory } from "./RaidHistory";

interface RaidData {
    raidsIn: RaidEvent[]
    raidsOut: RaidEvent[]
}
type RaidsByStreamer = Record<string, RaidData>

export interface RaidContainerProps {

}

export const RaidContainer = (props: RaidContainerProps) => {
    const stateContext = useContext(StateContext);
    const { state } = stateContext;

    const [myFollowed, theirFollowed] = useRaidTargets(state.streamer, state.username, state.accessToken);
    const [liveStreams] = useLiveChannels(state.username, state.accessToken);

    const [liveStreamsToDisplay, setLiveChannelsToDisplay] = useState<Record<string, StreamData>>({});

    const [raids, setRaids] = useState<RaidsByStreamer>({});

    useEffect(() => {
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

    useEffect(() => {
        async function getRaids() {
            if (state.username && state.streamer && state.accessToken) {
                const client = new HoagieClient();
                const raidData = await client.getRaids(state.username, state.accessToken, state.streamer);
                if (raidData) {
                    const raidByStreamer: RaidsByStreamer = {};
                    raidData.raids.forEach(raid => {
                        const direction = state?.streamer?.toLowerCase() === raid.to_broadcaster_user_login.toLowerCase() ? "in" : "out";
                        const key = direction === "in" ? raid.from_broadcaster_user_login.toLowerCase() : raid.to_broadcaster_user_login.toLowerCase();
                        raidByStreamer[key] = raidByStreamer[key] ?? { raidsIn: [], raidsOut: [] };
                        if (direction === "in") {
                            raidByStreamer[key].raidsIn.push(raid);
                        } else {
                            raidByStreamer[key].raidsOut.push(raid);
                        }
                    })
                    setRaids(raidByStreamer);
                }
            }
        }
        getRaids();
    }, [state.streamer, state.username, state.accessToken])

    if (state.username && !state.accessToken) {
        return <CircularProgress />
    }

    const sortedChannels = Object.values(liveStreamsToDisplay).sort((c1, c2) => StreamSorter.sort(c1, c2));
    const numChannels = sortedChannels.length;
    return <FlexCol>
        <Typography variant="h4">{`Raid Candidates ${numChannels > 0 ? `(${sortedChannels.length})` : ""}`}</Typography>
        <Table size="small">
            <TableBody>
                {sortedChannels.map(stream => (
                    <TableRow>
                        <TableCell width="10%">
                            <FlexRow alignItems="center">
                                <div style={{marginRight: 10}}>{StreamSorter.getSortRank(stream)}</div>
                                <ChannelLink username={stream.user_name}><img style={{ borderRadius: 25, height: 50, width: "auto" }} src={userInfo[stream.user_name]?.profile_image_url} /></ChannelLink>
                                <Typography variant="subtitle1">{stream.user_name}</Typography>
                            </FlexRow>
                        </TableCell>
                        <TableCell width="10%"><ChannelLink username={stream.user_name}><img style={{ height: 90 }} src={stream?.thumbnail_url.replace('{width}', '440').replace('{height}', '248')} /></ChannelLink></TableCell>
                        <TableCell>
                            <FlexCol alignItems="center">
                                <div>{stream?.viewer_count}</div>
                                <CountupTimer startDate={new Date(stream.started_at)} />
                            </FlexCol>
                        </TableCell>
                        <Hidden smDown><TableCell>{stream.title}</TableCell></Hidden>
                        <TableCell>
                            <RaidHistory
                                raidsIn={raids[stream.user_name.toLowerCase()]?.raidsIn ?? []}
                                raidsOut={raids[stream.user_name.toLowerCase()]?.raidsOut ?? []}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </FlexCol>
}

const ChannelLink = (props: { username: string, children: JSX.Element | JSX.Element[] }) => {
    return <a style={{marginRight: 10}} href={`https://www.twitch.tv/${props.username}`} target="_blank">
        {props.children}
    </a>
}