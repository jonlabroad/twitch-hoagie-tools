import { Hidden } from "@material-ui/core";
import React from "react";
import { ShoutoutAlertType } from "../../alerts/AlertType"
import { CopyButton } from "../../alerts/CopyButton";
import { IgnoreButton } from "../../alerts/IgnoreButton";
import Config from "../../Config";
import { CountdownTimer } from "../CountdownTimer";
import { FlexCol, FlexRow } from "../util/FlexBox";

export interface ShoutoutAlertCardProps {
    alert: ShoutoutAlertType;
}

export const ShoutoutAlertCard = (props: ShoutoutAlertCardProps) => {
    const { alert } = props;

    return <React.Fragment>
        <FlexRow className={`shoutout-card`}>
            <FlexRow alignItems="center">
                <a href={`https://www.twitch.tv/${alert.userData.display_name}`}>
                    <div className="alert-avatar">
                        <img src={alert.userData.profile_image_url} />
                    </div>
                </a>
                <FlexCol className="user-card-user-info">
                    <div className="user-card-username">
                        {alert.userData.display_name}
                    </div>
                    <div className="user-card-followers">
                        {alert.followers.total} followers
                    </div>
                </FlexCol>
                <Hidden mdDown>
                    <FlexCol className="user-card-channel-info">
                        <div className="user-card-broadcaster-type">
                            {alert.userData.broadcaster_type}
                        </div>
                        <div className="shoutout-card-game-name">
                            {alert.channelData.game_name}
                        </div>
                    </FlexCol>
                </Hidden>
            </FlexRow>
            <FlexCol alignItems="center">
                <IgnoreButton
                    alert={alert}
                />
                <CopyButton
                    text="Copy !so"
                    command={`!so ${alert.userData.login}`}
                />
            </FlexCol>
        </FlexRow>
    </React.Fragment>

}