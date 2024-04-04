import { Tooltip } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import "../../styles/TwitchAvatar.scss";
import { useMemo } from "react";

export interface TwitchAvatarProps {
  username: string;
  avatarImageUrl?: string;
}

export const TwitchAvatar = (props: TwitchAvatarProps) => {
  const { avatarImageUrl } = props;

  return (
    useMemo(() => (
    <Tooltip title={props.username} placement="top">
      <div className="twitch-avatar">
        {avatarImageUrl && <img src={avatarImageUrl} />}
        {!avatarImageUrl &&
          <AccountCircleIcon fontSize="large" style={{ fill: "grey" }}/>
        }
      </div>
    </Tooltip>
    ), [props.username, avatarImageUrl])
  );
}
