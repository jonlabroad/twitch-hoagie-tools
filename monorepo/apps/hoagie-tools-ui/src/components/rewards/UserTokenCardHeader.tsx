import { useContext } from "react";
import { TwitchUserInfoContext } from "../context/TwitchUserInfoProvider";
import { UserData } from "@hoagie/service-clients";
import { TwitchAvatar } from "../avatar/TwitchAvatar";
import { FlexRow } from "../util/FlexBox";
import { Typography } from "@mui/material";

interface Props {
  userId: string;
  numTokens: number;
  twitchUserData: UserData | undefined | null;
}

export const UserTokenCardHeader = (props: Props) => {
  const username = props.twitchUserData?.display_name ?? "";
  const userImage = props.twitchUserData?.profile_image_url ?? "";

  return (
    <FlexRow width="100%" justifyContent="space-between">
      <FlexRow>
        <TwitchAvatar
          username={username}
          avatarImageUrl={userImage}
        />
        <Typography variant="h6">{username}</Typography>
      </FlexRow>
      <FlexRow alignItems="center" marginRight={2}>
        <Typography variant="subtitle1">{props.numTokens} token{props.numTokens > 1 ? 's' : ''}</Typography>
      </FlexRow>
    </FlexRow>
  );
}
