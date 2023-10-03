import React from "react";
import "../styles/Indicators.scss"
import { FlexRow } from "./util/FlexBox";

export interface LiveIconProps {
    visible: boolean;
}

export const LiveIcon = (props: LiveIconProps) => {
    return <React.Fragment>
        {props.visible && <FlexRow className="live-icon">LIVE</FlexRow>}
    </React.Fragment>
}