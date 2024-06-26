import {
  CircularProgress,
  Hidden,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useLiveChannels, useRaidTargets } from "../../hooks/raidTargetHooks";
import HoagieClient from "../../service/HoagieClient";
import StreamSorter from "../../util/StreamSorter";
import { CountupTimer } from "../CountdownTimer";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { RaidEvent } from "./RaidEvent";
import { RaidHistory } from "./RaidHistory";
import { StateContext } from "../context/StateContextProvider";
import { LoginContext } from "../context/LoginContextProvider";
import { createTwitchClient } from "../../util/CreateTwitchClient";
import { StreamData, UserData } from "@hoagie/service-clients";

const filterOutTags = new Set<string>([
  "trance",
  "dj",
  "vtuber",
  "deathcore",
  "edm",
  "ebm",
  "livedjmusic",
  "electronicdancemusic",
  "livedj",
  "house",
  "housemusic",
  "videodj",
  "vtube",
  "techno",
  "drumandbass",
  "dnb",
  "dancehall",
  "reggae",
  "radio",
  "420",
]);

interface RaidData {
  raidsIn: RaidEvent[];
  raidsOut: RaidEvent[];
}
type RaidsByStreamer = Record<string, RaidData>;

export interface RaidContainerProps {}

export const RaidContainer = (props: RaidContainerProps) => {
  const stateContext = useContext(StateContext);
  const { state } = stateContext;
  const { state: loginState } = useContext(LoginContext);

  const [myFollowed] = useRaidTargets(
    state.streamer,
    loginState.username,
    loginState.accessToken
  );
  const [liveStreams] = useLiveChannels(
    loginState.username,
    loginState.accessToken
  );

  const [liveStreamsToDisplay, setLiveChannelsToDisplay] = useState<
    Record<string, StreamData>
  >({});

  const [raids, setRaids] = useState<RaidsByStreamer>({});

  useEffect(() => {
    if (myFollowed && liveStreams.length > 0) {
      const filtered: Record<string, StreamData> = {};
      liveStreams
        .filter(
          (c) =>
            c.game_name.toLowerCase().includes("music") &&
            /*
            && c.language === "en"
            && !c.user_name.toLowerCase().startsWith("dj")
            && !c.title.toLowerCase().startsWith("dj")
            && !c.title.toLowerCase().endsWith(" dj")
            && !c.title.toLowerCase().includes(" dj ")
            */
            (!!myFollowed[c.user_login])
          /*
           && !(c.tags ?? []).find(t => filterOutTags.has(t.toLowerCase()))
           && !(c.tags ?? []).find(tag => tag.startsWith("dj"))
           */
        )
        .forEach((c) => (filtered[c.user_login] = c));
      setLiveChannelsToDisplay(filtered);
    }
  }, [liveStreams, myFollowed]);

  const [userInfo, setUserInfo] = useState<Record<string, UserData>>({});
  useEffect(() => {
    async function get() {
      if (loginState.username && loginState.accessToken) {
        const client = createTwitchClient(loginState.accessToken);
        const users = await client.getUsersData(
          Object.values(liveStreamsToDisplay).map((c) => c.user_name)
        );
        const cInfo: Record<string, UserData> = {};
        users?.forEach((s) => (cInfo[s.display_name] = s));
        setUserInfo(cInfo);
      }
    }
    get();
  }, [liveStreamsToDisplay, loginState.username, loginState.accessToken]);

  useEffect(() => {
    async function getRaids() {
      if (loginState.userId && state.streamerId && loginState.accessToken) {
        const client = new HoagieClient();
        const raidData = await client.getRaids(
          loginState.userId,
          loginState.accessToken,
          state.streamerId
        );
        if (raidData) {
          const raidByStreamer: RaidsByStreamer = {};
          raidData.raids.forEach((raid) => {
            const direction =
              state?.streamerId ===
              raid.to_broadcaster_user_id
                ? "in"
                : "out";
            const key =
              direction === "in"
                ? raid.from_broadcaster_user_id
                : raid.to_broadcaster_user_id;
            raidByStreamer[key] = raidByStreamer[key] ?? {
              raidsIn: [],
              raidsOut: [],
            };
            if (direction === "in") {
              raidByStreamer[key].raidsIn.push(raid);
            } else {
              raidByStreamer[key].raidsOut.push(raid);
            }
          });
          setRaids(raidByStreamer);
        }
      }
    }
    getRaids();
  }, [state.streamerId, loginState.userId, loginState.accessToken]);

  if (loginState.userId && !loginState.accessToken) {
    return <CircularProgress />;
  }

  const sortedChannels = Object.values(liveStreamsToDisplay)
    .slice(0, 100)
    .sort((c1, c2) => StreamSorter.sort(c1, c2));
  const numChannels = Object.values(liveStreamsToDisplay).length;
  return (
    <FlexCol>
      <Typography variant="h4">{`Raid Candidates ${
        numChannels > 0 ? `(${numChannels})` : ""
      }`}</Typography>
      <Table size="small">
        <TableBody>
          {sortedChannels.map((stream) => (
            <TableRow>
              <TableCell>
                <FlexRow alignItems="center">
                  <Hidden xlDown>
                    <div style={{ marginRight: 10 }}>
                      {StreamSorter.getSortRank(stream)}
                    </div>
                  </Hidden>
                  <ChannelLink username={stream.user_name}>
                    <img
                      style={{ borderRadius: 25, height: 50, width: "auto" }}
                      src={userInfo[stream.user_name]?.profile_image_url}
                    />
                  </ChannelLink>
                  <Typography variant="subtitle1">
                    {stream.user_name}
                  </Typography>
                </FlexRow>
              </TableCell>
              <TableCell>
                <Hidden smDown>
                  <ChannelLink username={stream.user_name}>
                    <img
                      style={{ height: 90 }}
                      src={stream?.thumbnail_url
                        .replace("{width}", "440")
                        .replace("{height}", "248")}
                    />
                  </ChannelLink>
                </Hidden>
              </TableCell>
              <TableCell>
                <FlexCol flexGrow={1} alignItems="center">
                  <div>{stream?.viewer_count}</div>
                  <CountupTimer startDate={new Date(stream.started_at)} />
                </FlexCol>
              </TableCell>
              <Hidden mdDown>
                <TableCell>
                  <FlexCol>
                    <p>{stream.title}</p>
                    <p>{(stream.tags ?? []).join(" ")}</p>
                  </FlexCol>
                </TableCell>
              </Hidden>
              <TableCell>
                <RaidHistory
                  raidsIn={raids[stream.user_id]?.raidsIn ?? []}
                  raidsOut={
                    raids[stream.user_id]?.raidsOut ?? []
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FlexCol>
  );
};

const ChannelLink = (props: {
  username: string;
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <a
      style={{ marginRight: 10 }}
      href={`https://www.twitch.tv/${props.username}`}
      target="_blank"
    >
      {props.children}
    </a>
  );
};
