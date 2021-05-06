import React from "react"
import AlertType from "../../alerts/AlertType"
import { FlexCol, FlexRow } from "../util/FlexBox"

import "../../styles/AlertCard.scss"
import { Card } from "@material-ui/core"
import { CountdownTimer } from "../CountdownTimer"
import Config from "../../Config"

const alertTypeMappings: Record<string, string> = {
    "chat_eval": "Message Review"
}

export interface AlertCardProps {
    alert: AlertType;
    children: JSX.Element[] | JSX.Element
}

export const AlertCard = (props: AlertCardProps) => {
    const { alert } = props;
    const dateStamp = new Date(alert.timestamp ?? "");
    const expiry = Config.alertExpirySec[alert.type];
    return <React.Fragment>
        <Card className="alert-card">
            <div className="alert-card-content">
                <FlexCol>
                    <FlexRow justifyContent="space-between">
                        <div className={`alert-card-type ${alert.type}-type`}>{alertTypeMappings[alert.type] ?? alert.type}</div>
                        <CountdownTimer
                            expiryDate={new Date(dateStamp.getTime() + expiry * 1e3)}
                        />
                    </FlexRow>
                    {props.children}
                </FlexCol>
            </div>
        </Card>
    </React.Fragment>
}