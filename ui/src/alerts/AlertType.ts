import { ChatMessage } from "../components/chat/SimpleChatDisplay";

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
    userData: any;
    channelData: any;

    constructor(message: ChatMessage, userData: any, channelData: any) {
        super(message);
        this.type = "shoutout";
        this.userData = userData;
        this.channelData = channelData;
    }
}
