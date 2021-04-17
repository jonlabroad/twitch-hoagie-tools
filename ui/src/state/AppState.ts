import AlertType from "../alerts/AlertType";
import { ChatMessage } from "../components/chat/SimpleChatDisplay";

export interface StateContextType {
    dispatch: any,
    state: AppState;
}

export const defaultAppState: AppState = {
    username: undefined,
    accessToken: undefined,
    isLoggedIn: false,
    chat: {
        connected: false,
        messages: [],
    },
    alert: {
        alerts: []
    }
};

export interface AppState {
    username?: string;
    streamer?: string;
    accessToken?: string;
    isLoggedIn: boolean;
    chat: ChatState;
    alert: AlertState;
}

export interface ChatState {
    connected: boolean;
    messages: ChatMessage[];
}

export interface AlertState {
    alerts: AlertType[];
}

export interface ModAlert {
    priority: number;
    message: string;
}