import { Grid } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { EvaluatedMessageAlert, ShoutoutAlertType } from "../../alerts/AlertType";
import { useAlertTrimming } from "../../hooks/alertTrimHooks";
import { useChannelInfo } from "../../hooks/channelInfoHooks";
import { useModActionTrimming } from "../../hooks/modActionTrimHooks";
import { useStatePersistance } from "../../hooks/persistanceHooks";
import { useStreamerSongListEvents } from "../../hooks/streamersonglistHooks";
import { IgnoreShoutoutModAction } from "../../state/AppState";
import { AddAlertAction } from "../../state/AppStateReducer";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { ChatEvalCard } from "../chatEval/ChatEvalCard";
import { AlertContext, StateContext } from "../MainPage";
import { AlertCard } from "./AlertCard";
import { ShoutoutAlertCard } from "./ShoutoutAlertCard";

export interface AlertContainerProps {
}

export const AlertContainer = (props: AlertContainerProps) => {
    const stateContext = useContext(StateContext);
    const alertContext = useContext(AlertContext);

    // This should probably go on a higher level component, but MainPage doesn't use the state context...
    useStatePersistance(stateContext.state.streamer ?? "", stateContext);

    const { chat, alert } = stateContext.state;

    useAlertTrimming(stateContext);
    useModActionTrimming(stateContext);
    useChannelInfo(stateContext.state.streamer, stateContext);
    useStreamerSongListEvents(stateContext);

    const [lastMessage, setLastMessage] = useState<ChatMessage | undefined>(undefined);
    useEffect(() => {
        if (chat.messages.length > 0) {
            setLastMessage(chat.messages[chat.messages.length - 1]);
        }
    }, [chat.messages]);

    useEffect(() => {
        async function processMsg() {
            if (lastMessage) {
                const alerts = await alertContext?.alertGenerator?.fromChatMessage(lastMessage, stateContext.state) ?? [];
                stateContext.dispatch({
                    type: "add_alerts",
                    alerts,
                } as AddAlertAction);
            }
        }
        processMsg();
    }, [lastMessage])

    const shoutoutAlerts = alert.alerts.filter(a => a.type === "shoutout").filter(alert => !stateContext.state.modActions.actions.find(action =>
        action.type === "ignore_shoutout" && ((action as IgnoreShoutoutModAction).alertKey === alert.key)));

    return (<React.Fragment>
        <Grid item xs={12} md={6}>
            {shoutoutAlerts.map((alert, i) => (
                <React.Fragment key={i}>
                    <AlertCard key={i}
                        alert={alert}
                    >
                        <ShoutoutAlertCard alert={alert as ShoutoutAlertType} />
                    </AlertCard>
                </React.Fragment>
            ))}
        </Grid>
    </React.Fragment>
    );
}