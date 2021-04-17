import AlertType from "../alerts/AlertType"
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import StreamEvent from "../events/StreamEvent";
import { AppState } from "./AppState"

export interface AppStateAction {
    type: "add_alerts" | "remove_alerts" | "add_event" | "add_chat_message" | "login";
}

export interface AddAlertAction extends AppStateAction {
    alerts: AlertType[];
}

export interface RemoveAlertAction extends AppStateAction {
    alerts: AlertType[];
}

export interface AddEventAction extends AppStateAction {
    event: StreamEvent;
}

export interface AddChatMessageAction extends AppStateAction {
    message: ChatMessage;
}

export interface LoginAction extends AppStateAction {
    username: string;
    accessToken: string;
    isLoggedIn: boolean;
}

export const appStateReducer = (state: AppState, action: AppStateAction): AppState => {
    switch (action.type) {
        case "add_alerts": {
            const addAlertAction = action as AddAlertAction;
            const newAlerts = addAlertAction.alerts.filter(a => !state.alert.alerts.find(o => a.key() === o.key()));
            return {
                ...state,
                alert: {
                    alerts: [...state.alert.alerts, ...newAlerts],
                }
            }
        }
        case "remove_alerts": {
            const removeAlertAction = action as RemoveAlertAction;
            const newAlerts = state.alert.alerts.filter(a => !removeAlertAction.alerts.find(o => a.key() === o.key()));
            return {
                ...state,
                alert: {
                    alerts: newAlerts,
                }
            }
        }
        case "add_event": {
            const addEventAction = action as AddEventAction;
            return {
                ...state,
                event: {
                    events: [...state.event.events, addEventAction.event],
                }
            }
        }
        case "add_chat_message": {
            const addChatMsgAction = action as AddChatMessageAction;
            return {
                ...state,
                chat: {
                    ...state.chat,
                    messages: [...state.chat.messages, addChatMsgAction.message],
                }
            }
        }
        case "login": {
            const loginAction = action as LoginAction;
            return {
                ...state,
                username: loginAction.username,
                accessToken: loginAction.accessToken,
                isLoggedIn: loginAction.isLoggedIn,
            };
        }
        default:
            console.error(`Do not know how to process ${action.type}`);
    }
    return state;
}