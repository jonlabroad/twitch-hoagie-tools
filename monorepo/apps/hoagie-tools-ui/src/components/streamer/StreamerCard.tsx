import { StreamData, UserData } from "@hoagie/service-clients";
import { Avatar, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { FlexCol, FlexRow } from "../util/FlexBox";
import { Link, Navigate, generatePath, useNavigate } from "react-router-dom";
import Config from "../../Config";
import { useContext, useEffect, useState } from "react";
import { createTwitchClient } from "../../util/CreateTwitchClient";
import { LoginContext } from "../context/LoginContextProvider";
import { StreamLiveIcon } from "../icon/StreamLive";

interface StreamerCardProps {
  streamerId: string;
  userData: UserData;
}

export const StreamerCard = (props: StreamerCardProps) => {
  const { streamerId, userData } = props;
  const { state: loginState } = useContext(LoginContext);
  const [streamInfo, setStreamInfo] = useState<StreamData | undefined>(undefined);

  useEffect(() => {
    async function fetchStreamData() {
      if (loginState.accessToken && streamerId) {
        const twitchClient = createTwitchClient(loginState.accessToken);
        const streamInfo = (await twitchClient.getStreamsByUserId([streamerId]))?.[0];
        if (streamInfo) {
          setStreamInfo(streamInfo);
        }
      }
    }
    fetchStreamData();
  }, [loginState.accessToken, streamerId])

  const streamerPage = Config.pages["songlistAndDono"];
  const pageLink = generatePath(streamerPage.path, { streamer: userData.login.toLowerCase() });

  const navigate = useNavigate();

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
