import React from "react";
import { ShoutoutAlertType } from "../../alerts/AlertType"
import { CopyButton } from "../../alerts/CopyButton";
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
                <FlexCol>
                    <div className="user-card-username">
                        {alert.userData.display_name}
                    </div>
                    <div className="user-card-broadcaster-type">
                        {alert.userData.broadcaster_type}
                    </div>
                    <div className="user-card-followers">
                        {alert.followers.total} followers
                </div>
                    <div className="shoutout-card-game-name">
                        {alert.channelData.game_name}
                    </div>
                </FlexCol>
            </FlexRow>
            <CopyButton
                text="Copy Cmd"
                command={`!so ${alert.userData.login}`}
            />
        </FlexRow>
    </React.Fragment>

}