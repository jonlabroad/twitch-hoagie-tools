import AlertType from "../alerts/AlertType"
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import { AppState } from "./AppState"

export interface AppStateAction {
    type: "add_alert" | "add_chat_message" | "login";
}

export interface AddAlertAction extends AppStateAction {
    alert: AlertType;
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
        case "add_alert": {
            const addAlertAction = action as AddAlertAction;
            // Do not add if it already exists
            const existing = state.alert.alerts.find(alert => alert.key() === addAlertAction.alert.key());
            if (!existing) {
                return {
                    ...state,
                    alert: {
                        alerts: [...state.alert.alerts, addAlertAction.alert],
                    }
                }
            }
            break;
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