import { StreamData, UserData } from "@hoagie/service-clients";
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import StreamEvent from "../events/StreamEvent";
import { GetHistoryResponse, GetQueueResponse } from "../service/StreamerSongListClient";
import { AppState, createIgnoreShoutoutModAction, IgnoreShoutoutModAction, ModAction } from "./AppState"

export interface AppStateAction {
    type: "add_alerts" | "remove_alerts" | "add_event" | "add_chat_message" | "add_chat_eval" | "ignore_shoutout" | "remove_mod_actions" | "login" | "set_streamer" | "set_channel_info" | "set_chat_connection" | "update_songqueue" | "update_songhistory";
}

export interface AddEventAction extends AppStateAction {
    event: StreamEvent;
}

export interface AddChatMessageAction extends AppStateAction {
    message: ChatMessage;
}

export interface IgnoreShoutoutAction extends AppStateAction {
    alertKey: string;
}

export interface RemoveModActionsAction extends AppStateAction {
    modActions: ModAction[];
}

export interface LoginAction extends AppStateAction {
    username: string;
    accessToken: string;
    isLoggedIn: boolean;
}

export interface SetChannelInfoAction extends AppStateAction {
    userData: UserData;
    streamData: StreamData;
}

export interface SetStreamerAction extends AppStateAction {
    streamer: string;
}

export interface SetChatConnectionAction extends AppStateAction {
    connected: boolean;
}

export interface UpdateSongQueueAction extends AppStateAction {
    queue: GetQueueResponse;
}

export interface UpdateSongHistoryAction extends AppStateAction {
    history: GetHistoryResponse;
}

export const appStateReducer = (state: AppState, action: AppStateAction): AppState => {
    switch (action.type) {
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
        case "ignore_shoutout": {
            const ignoreAlertAction = action as IgnoreShoutoutAction;
            const newAction = createIgnoreShoutoutModAction(ignoreAlertAction.alertKey);
            return {
                ...state,
                modActions: {
                    actions: [...state.modActions.actions, newAction]
                }
            }
        }
        case "remove_mod_actions": {
            const removeModActionsAction = action as RemoveModActionsAction;
            return {
                ...state,
                modActions: {
                    actions: state.modActions.actions.filter(action => !removeModActionsAction.modActions.map(a => a.key).includes(action.key))
                }
            }
        }
        case "set_streamer": {
            const setStreamerAction = action as SetStreamerAction;
            return {
                ...state,
                streamer: setStreamerAction.streamer
            }
        }
        case "set_channel_info": {
            const setChannelInfoAction = action as SetChannelInfoAction;
            return {
                ...state,
                streamerData: {
                    userData: setChannelInfoAction.userData,
                    streamData: setChannelInfoAction.streamData,
                }

            }
        }
        case "set_chat_connection": {
            const setChatConnection = action as SetChatConnectionAction;
            return {
                ...state,
                chat: {
                    ...state.chat,
                    connected: setChatConnection.connected,
                }
            }
        }
        case "update_songqueue": {
          console.log("update_songqueue");
            const updateQueue = action as UpdateSongQueueAction;
            return {
                ...state,
                songQueue: updateQueue.queue,
            };
        }
        case "update_songhistory": {
            const updateHistory = action as UpdateSongHistoryAction;
            return {
                ...state,
                songHistory: updateHistory.history,
            };
        }

        default:
            console.error(`Do not know how to process ${action.type}`);
    }
    return state;
}
