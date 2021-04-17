import React from "react"
import AlertType, { ShoutoutAlertType } from "../../alerts/AlertType"
import { FlexRow } from "../util/FlexBox"

import "../../styles/AlertCard.scss"

export interface AlertCardProps {
    alert: AlertType;
}

export const AlertCard = (props: AlertCardProps) => {
    const shoutoutAlert = props.alert as ShoutoutAlertType;
    return <FlexRow className="alert-card">
        <div className="alert-avatar">
            <img src={shoutoutAlert.userData[0].profile_image_url} />
        </div>
        <div className="alert-username">
            {shoutoutAlert.message?.username}
        </div>
        <div className="alert-game-name">
            {shoutoutAlert.channelData?.data[0].game_name}
        </div>
    </FlexRow>
}