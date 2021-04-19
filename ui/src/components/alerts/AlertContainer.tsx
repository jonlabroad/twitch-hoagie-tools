import { Grid } from "@material-ui/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useAlertTrimming } from "../../hooks/alertTrimHooks";
import { useModActionTrimming } from "../../hooks/modActionTrimHooks";
import { useStatePersistance } from "../../hooks/persistanceHooks";
import { IgnoreShoutoutModAction } from "../../state/AppState";
import { AddAlertAction } from "../../state/AppStateReducer";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { AlertContext, StateContext } from "../MainPage";
import { AlertCard } from "./AlertCard";

export interface AlertContainerProps {

}

export const AlertContainer = (props: AlertContainerProps) => {
    const stateContext = useContext(StateContext);
    const alertContext = useContext(AlertContext);

    // This should probably go on a higher level component, but MainPage doesn't use the state context...
    useStatePersistance(stateContext.state.streamer ?? "", stateContext);

    const { chat, alert } = stateContext.state;

    const [lastMessage, setLastMessage] = useState<ChatMessage | undefined>(undefined);

    useAlertTrimming(stateContext);
    useModActionTrimming(stateContext);

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

    return (<React.Fragment>
        <Grid container spacing={3}>
            <Grid item xs={4}>
                {alert.alerts.filter(alert => !stateContext.state.modActions.actions.find(action => 
                    action.type === "ignore_shoutout" && ((action as IgnoreShoutoutModAction).alertKey === alert.key)))
                    .map((alert, i) => (
                        <React.Fragment key={i}>
                            <AlertCard key={i}
                                alert={alert}
                            />
                        </React.Fragment>
                    ))}
            </Grid>
        </Grid>
    </React.Fragment>
    );
}