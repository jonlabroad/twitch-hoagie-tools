import React from "react";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { EvaluatedMessageAlert } from "../../alerts/AlertType";
import { FlexCol, FlexRow } from "../util/FlexBox";

import "../../styles/ChatEval.scss";

const highAlertThreshold = 0.9;
const alertShowThreshold = 0.6;

export interface ChatEvalCardProps {
    alert: EvaluatedMessageAlert
}

export const ChatEvalCard = (props: ChatEvalCardProps) => {
    const { alert } = props;

    const sortedEvaluations = Object.keys(alert.evaluation)
        .sort((a, b) => alert.evaluation[b] - alert.evaluation[a])
        .map(key => ({key, eval: alert.evaluation[key]}))
        .filter(e => e.eval > alertShowThreshold);

    const isHighAlert = !!sortedEvaluations.find(e => e.eval >= highAlertThreshold);

    return <React.Fragment>
        <FlexRow className={`chat-eval-card`}>
            <FlexRow className={"chat-eval-message-container"}>
                <a href={`https://www.twitch.tv/${alert.userData.display_name}`}>
                    <div className="alert-avatar">
                        <img src={alert.userData.profile_image_url} />
                    </div>
                </a>
                <FlexCol className="user-card-user-info">
                    <div className="chat-eval-card-username">
                        {alert.userData.display_name}
                    </div>
                    <FlexRow className={`chat-eval-message ${isHighAlert ? "chat-eval-high-alert-card" : ""}`}>
                        {alert.message?.message}
                    </FlexRow>
                </FlexCol>
            </FlexRow>
            <FlexRow alignItems="center">
                <FlexCol>
                    {sortedEvaluations
                        .map(e => {
                            const highAlertText = e.eval >= highAlertThreshold;
                        return (
                            <FlexRow className={`chat-eval-evaluations ${highAlertText ? "chat-eval-high-alert-eval" : ""}`}>
                                <div style={{marginRight: 5}}>{e.key}</div>
                                <div>{Math.round(e.eval * 1000) / 10}</div>
                            </FlexRow>
                        )
                    })}
                </FlexCol>
                {/* todo buttons */}
                
            </FlexRow>
        </FlexRow>
    </React.Fragment>
}
