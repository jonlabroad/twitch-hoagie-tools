import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import { ChannelData, UserData, UsersFollows } from "../service/TwitchClientTypes";

export type AlertTypeType = "shoutout" | "generic";

export const createBaseAlert = (type: AlertTypeType, message: ChatMessage): AlertType => {
    return {
        type,
        timestamp: new Date().toISOString(),
        message,
        key: `${type}_${message?.username ?? ""}`
    };
}

export default interface AlertType {
    type: AlertTypeType;
    message?: ChatMessage;
    timestamp?: string;

    key: string
}

export const createShoutoutAlert = (message: ChatMessage, userData: UserData, channelData: ChannelData, followers: UsersFollows) => {
    let alert = createBaseAlert("shoutout", message) as ShoutoutAlertType;
    alert.userData = userData;
    alert.channelData = channelData;
    alert.followers = followers;
    alert.key = `${alert.type}_${alert?.userData.login ?? ""}`;
    return alert;
}

export interface ShoutoutAlertType extends AlertType {
    userData: UserData;
    channelData: ChannelData;
    followers: UsersFollows;
}
