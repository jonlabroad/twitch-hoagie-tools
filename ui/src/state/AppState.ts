import AlertType, { AlertTypeType } from "../alerts/AlertType";
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import StreamEvent from "../events/StreamEvent";
import { UserData } from "../service/TwitchClientTypes";

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
    },
    event: {
        events: []
    },
    modActions: {
        actions: []
    }
};

export interface AppState {
    username?: string;
    streamer?: string;
    streamerData?: UserData;
    accessToken?: string;
    isLoggedIn: boolean;
    chat: ChatState;
    alert: AlertState;
    event: EventState;
    modActions: ModActionState;
}

export interface ChatState {
    connected: boolean;
    messages: ChatMessage[];
}

export interface AlertState {
    alerts: AlertType[];
}

export interface EventState {
    events: StreamEvent[];
}

export interface ModAlert {
    priority: number;
    message: string;
}

export type ModActionType = "ignore_shoutout" | "ignore_chat_eval";

export interface ModAction {
    key: string
    type: ModActionType
    timestamp: Date
}

export const createIgnoreShoutoutModAction = (alertKey: string): IgnoreShoutoutModAction  => {
    return {
        key: `ignore_shoutout_${alertKey}`,
        type: "ignore_shoutout",
        alertKey,
        timestamp: new Date(),
    } as IgnoreShoutoutModAction;
}

export interface IgnoreShoutoutModAction extends ModAction {
    alertType: AlertTypeType
    alertKey: string
}

export interface ModActionState {
    actions: ModAction[]
}
