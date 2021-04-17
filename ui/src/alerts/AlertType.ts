import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import { UserData } from "../service/TwitchClientTypes";

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
    channelData: any;

    constructor(message: ChatMessage, userData: UserData, channelData: any) {
        super(message);
        this.type = "shoutout";
        this.userData = userData;
        this.channelData = channelData;

        this.key = () => `${this.type}_${this?.userData.login ?? ""}`;
    }
}
