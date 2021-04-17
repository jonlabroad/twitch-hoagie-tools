import React, { useContext, useEffect, useRef, useState } from "react";
import AlertGenerator from "../../alerts/AlertGenerator";
import AlertTrimmer from "../../alerts/AlertTrimmer";
import { StateContextType } from "../../state/AppState";
import { AddAlertAction } from "../../state/AppStateReducer";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { AlertContext, StateContext } from "../MainPage";
import { AlertCard } from "./AlertCard";

export interface AlertContainerProps {

}

const trimAlerts = (stateContext: StateContextType) => {
    const trimmedAlerts = AlertTrimmer.getAlertsToTrim(stateContext.state.alert.alerts, stateContext.state.event.events);
    if (trimmedAlerts.length > 0) {
        stateContext.dispatch({
            type: "remove_alerts",
            alerts: trimmedAlerts,
        } as AddAlertAction);
    }
}

export const AlertContainer = (props: AlertContainerProps) => {
    const stateContext = useContext(StateContext);
    const alertContext = useContext(AlertContext);
    const { chat, alert } = stateContext.state;

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

    useEffect(() => {
        trimAlerts(stateContext);
    }, [stateContext.state.event.events]);

    return (<React.Fragment>
        {alert.alerts.map((alert, i) => (
            <React.Fragment key={i}>
                <AlertCard key={i}
                    alert={alert}
                />
            </React.Fragment>
        ))}
    </React.Fragment>
    );
}