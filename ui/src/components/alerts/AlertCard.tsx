import React from "react"
import AlertType, { ShoutoutAlertType } from "../../alerts/AlertType"
import { FlexCol, FlexRow } from "../util/FlexBox"

import "../../styles/AlertCard.scss"
import { ShoutoutAlertCard } from "./ShoutoutAlertCard"
import { Card } from "@material-ui/core"

export interface AlertCardProps {
    alert: AlertType;
}

export const AlertCard = (props: AlertCardProps) => {
    const { alert } = props;
    const shoutoutAlert = props.alert as ShoutoutAlertType;
    return <React.Fragment>
        <Card className="alert-card">
            <div className="alert-card-content">
                <FlexCol>
                    <div className={`alert-card-type ${alert.type}-type`}>{alert.type}</div>
                    <ShoutoutAlertCard alert={shoutoutAlert} />
                </FlexCol>
            </div>
        </Card>
    </React.Fragment>
}