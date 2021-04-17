import React, { useContext, useEffect, useRef, useState } from "react";
import AlertGenerator from "../../alerts/AlertGenerator";
import { AddAlertAction } from "../../state/AppStateReducer";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { AlertContext, StateContext } from "../MainPage";
import { AlertCard } from "./AlertCard";

export interface AlertContainerProps {

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
                const alerts = await alertContext?.alertGenerator?.fromChatMessage(lastMessage) ?? [];
                alerts.forEach(alert => {
                    stateContext.dispatch({
                        type: "add_alert",
                        alert,
                    } as AddAlertAction)
                });
            }
        }
        processMsg();
    }, [lastMessage])

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