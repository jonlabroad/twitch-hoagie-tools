import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import { ChannelData, UserData, UsersFollows } from "../service/TwitchClientTypes";

export default abstract class AlertType {
    type: "shoutout" | "generic" = "generic";
    message?: ChatMessage;
    timestamp?: Date;

    key: () => string = () => `${this.type}_${this?.message?.username ?? ""}`;

    constructor(message: ChatMessage) {
        this.timestamp = new Date();
        this.message = message;
    }
}

export class ShoutoutAlertType extends AlertType {
    userData: UserData;
    channelData: ChannelData;
    followers: UsersFollows;

    constructor(message: ChatMessage, userData: UserData, channelData: ChannelData, followers: UsersFollows) {
        super(message);
        this.type = "shoutout";
        this.userData = userData;
        this.channelData = channelData;
        this.followers = followers;

        this.key = () => `${this.type}_${this?.userData.login ?? ""}`;
    }
}
