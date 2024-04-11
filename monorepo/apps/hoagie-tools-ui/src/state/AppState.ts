import { StreamData, UserData } from "@hoagie/service-clients";
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import StreamEvent from "../events/StreamEvent";
import { GetHistoryResponse, GetQueueResponse } from "../service/StreamerSongListClient";

export interface StateContextType {
    dispatch: any,
    state: AppState;
}

export const defaultAppState: AppState = {
    streamerId: undefined,
    chat: {
        connected: false,
        messages: [],
    },
    event: {
        events: []
    },
    modActions: {
        actions: []
    }
};

export interface AppState {
    streamer?: string;
    streamerId: string | undefined;
    streamerData?: {
        userData: UserData;
        streamData: StreamData;
    },
    chat: ChatState;
    event: EventState;
    modActions: ModActionState;
    songQueue?: GetQueueResponse;
    songHistory?: GetHistoryResponse;
}

export interface ChatState {
    connected: boolean;
    messages: ChatMessage[];
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
    alertKey: string
}

export interface ModActionState {
    actions: ModAction[]
}
