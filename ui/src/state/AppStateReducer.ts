import { ExecOptionsWithStringEncoding } from "node:child_process";
import { stringify } from "qs";
import AlertType, { AlertTypeType } from "../alerts/AlertType"
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import StreamEvent from "../events/StreamEvent";
import { GetQueueResponse } from "../service/StreamerSongListClient";
import { ChannelData, StreamData, UserData } from "../service/TwitchClientTypes";
import { AppState, createIgnoreShoutoutModAction, IgnoreShoutoutModAction, ModAction } from "./AppState"

export interface AppStateAction {
    type: "add_alerts" | "remove_alerts" | "add_event" | "add_chat_message" | "add_chat_eval" | "ignore_shoutout" | "remove_mod_actions" | "login" | "set_channel_info" | "set_chat_connection" | "update_songqueue";
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

export interface SetChatConnectionAction extends AppStateAction {
    connected: boolean;
}

export interface UpdateSongQueueAction extends AppStateAction {
    queue: GetQueueResponse;
}

export const appStateReducer = (state: AppState, action: AppStateAction): AppState => {
    switch (action.type) {
        case "add_alerts": {
            const addAlertAction = action as AddAlertAction;
            let newAlerts = [...state.alert.alerts];
            addAlertAction.alerts.forEach(newAlert => {
                const existingAlertIndex = newAlerts.findIndex(a => a.key === newAlert.key);
                if (existingAlertIndex >= 0) {
                    console.log({ existingAlertIndex });
                    newAlerts = [...newAlerts.slice(0, existingAlertIndex), newAlert, ...newAlerts.slice(existingAlertIndex + 1)];
                } else {
                    console.log({ newAlert });
                    newAlerts.push(newAlert);
                }
            })
            return {
                ...state,
                alert: {
                    alerts: newAlerts
                }
            }
        }
        case "remove_alerts": {
            const removeAlertAction = action as RemoveAlertAction;
            const newAlerts = state.alert.alerts.filter(a => !removeAlertAction.alerts.find(o => a.key === o.key));
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
        case "ignore_shoutout": {
            const ignoreAlertAction = action as IgnoreShoutoutAction;
            const newAction = createIgnoreShoutoutModAction(ignoreAlertAction.alertKey);
            console.log({ newAction });
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
        case "login": {
            const loginAction = action as LoginAction;
            return {
                ...state,
                username: loginAction.username,
                accessToken: loginAction.accessToken,
                isLoggedIn: loginAction.isLoggedIn,
            };
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
            const updateQueue = action as UpdateSongQueueAction;
            return {
                ...state,
                songQueue: updateQueue.queue,
            };
        }
        default:
            console.error(`Do not know how to process ${action.type}`);
    }
    return state;
}