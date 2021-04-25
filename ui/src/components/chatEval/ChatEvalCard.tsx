import React from "react";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { EvaluatedMessageAlert } from "../../alerts/AlertType";
import { FlexCol, FlexRow } from "../util/FlexBox";

import "../../styles/ChatEval.scss";

export interface ChatEvalCardProps {
    alert: EvaluatedMessageAlert
}

export const ChatEvalCard = (props: ChatEvalCardProps) => {
    const { alert } = props;

    const sortedEvaluations = Object.keys(alert.evaluation)
        .sort((a, b) => alert.evaluation[b] - alert.evaluation[a])
        .map(key => ({key, eval: alert.evaluation[key]}))
        .filter(e => e.eval > 0.30);

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
                    <div className="chat-eval-message">
                        {alert.message?.message}
                    </div>
                </FlexCol>
            </FlexRow>
            <FlexRow alignItems="center">
                <FlexCol>
                    {sortedEvaluations
                        .map(e => {
                        return (
                            <FlexRow className="chat-eval-evaluations">
                                <div style={{marginRight: 5}}>{e.key}</div>
                                <div>{Math.round(e.eval * 10000) / 100}</div>
                            </FlexRow>
                        )
                    })}
                </FlexCol>
                {/* todo buttons */}
                
            </FlexRow>
        </FlexRow>
    </React.Fragment>
}
