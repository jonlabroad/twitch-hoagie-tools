import React from "react"
import AlertType, { ShoutoutAlertType } from "../../alerts/AlertType"
import { FlexCol, FlexRow } from "../util/FlexBox"

import "../../styles/AlertCard.scss"
import { ShoutoutAlertCard } from "./ShoutoutAlertCard"
import { Card } from "@material-ui/core"
import { CountdownTimer } from "../CountdownTimer"
import Config from "../../Config"

export interface AlertCardProps {
    alert: AlertType;
}

export const AlertCard = (props: AlertCardProps) => {
    const { alert } = props;
    const shoutoutAlert = props.alert as ShoutoutAlertType;
    const dateStamp = new Date(alert.timestamp ?? "");
    const expiry = Config.alertExpirySec[alert.type];
    return <React.Fragment>
        <Card className="alert-card">
            <div className="alert-card-content">
                <FlexCol>
                    <FlexRow justifyContent="space-between">
                        <div className={`alert-card-type ${alert.type}-type`}>{alert.type}</div>
                        <CountdownTimer
                            expiryDate={new Date(dateStamp.getTime() + expiry * 1e3)}
                        />
                    </FlexRow>
                    <ShoutoutAlertCard alert={shoutoutAlert} />
                </FlexCol>
            </div>
        </Card>
    </React.Fragment>
}