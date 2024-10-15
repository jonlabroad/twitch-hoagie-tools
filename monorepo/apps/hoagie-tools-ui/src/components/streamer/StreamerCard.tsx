import { ChannelSchedule, StreamData, UserData } from "@hoagie/service-clients";
import { Avatar, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { Link, Navigate, generatePath, useNavigate } from "react-router-dom";
import Config from "../../Config";
import { useCallback, useContext, useEffect, useState } from "react";
import { createTwitchClient } from "../../util/CreateTwitchClient";
import { LoginContext } from "../context/LoginContextProvider";
import { StreamLiveIcon } from "../icon/StreamLive";

interface StreamerCardProps {
  streamerId: string;
  userData: UserData;
  schedule: ChannelSchedule | undefined;
}

export const StreamerCard = (props: StreamerCardProps) => {
  const { streamerId, userData } = props;
  const { state: loginState } = useContext(LoginContext);
  const [streamInfo, setStreamInfo] = useState<StreamData | undefined>(undefined);

  const fetchStreamData = useCallback(async () => {
    if (loginState.accessToken && streamerId) {
      const twitchClient = createTwitchClient(loginState.accessToken);
      const streamInfo = (await twitchClient.getStreamsByUserId([streamerId]))?.[0];
      if (streamInfo) {
        setStreamInfo(streamInfo);
      }
    }
  }, [loginState.accessToken, streamerId]);

  useEffect(() => {
    fetchStreamData();
  }, [fetchStreamData])

  // refresh stream info every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStreamData();
    }, 3 * 60 * 1e3);
    return () => clearInterval(interval);
  }, [fetchStreamData]);

  const streamerPage = Config.pages["songlistAndDono"];
  const pageLink = generatePath(streamerPage.path, { streamer: userData.login.toLowerCase() });

  const navigate = useNavigate();

  const renderSchedule = useCallback(() => {
    if (streamInfo || !props.schedule) {
      return null;
    }

    const nextScheduled = props.schedule.segments.find(s => !s.canceled_until);

    if (!nextScheduled) {
      return null;
    }

    const nextScheduledTime = new Date(nextScheduled.start_time);
    //Format time like date, day of week, and time
    const formattedTime = nextScheduledTime.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    return <>
      <div>
        <Typography variant="body2">{nextScheduled?.title}</Typography>
        <Typography variant="body2">{formattedTime}</Typography>
      </div>
    </>
  }, [props.schedule, streamInfo]);

  return (
      <Card style={{ height: 100, marginBottom: 14, cursor: "pointer" }} onClick={() => { navigate(pageLink); navigate(0) }}>
        <CardActionArea style={{ padding: 14 }}>
          <FlexRow justifyContent="space-between">
          <FlexRow alignItems="center" height={"100%"}>
              <div style={{ position: "relative" }}>
                <Avatar style={{ height: 70, width: 70, marginRight: 16 }} src={userData.profile_image_url} />
                <StreamLiveIcon style={{ position: "absolute", bottom: -5, left: 0 }} isLive={!!streamInfo?.id}/>
              </div>
              <FlexCol>
                <Typography variant="h5">{userData.display_name}</Typography>
                {streamInfo?.title && <Typography style={{ color: "grey" }} variant="body2">{streamInfo.title}</Typography>}
                {renderSchedule()}
              </FlexCol>
          </FlexRow>
          {streamInfo &&
            <div style={{ borderStyle: "solid", borderWidth: 1, borderColor: "#8f53e9" }}>
              <img
                style={{ height: 70 }}
                src={streamInfo?.thumbnail_url
                .replace("{width}", "440")
                .replace("{height}", "248")}
              />
            </div>
          }
          </FlexRow>
        </CardActionArea>
      </Card>
  );
};
