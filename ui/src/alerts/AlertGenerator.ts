import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import TwitchClient from "../service/TwitchClient";
import AlertType, { ShoutoutAlertType } from "./AlertType";

export interface AlertContextType {
    alertGenerator?: AlertGenerator;
}

export default class AlertGenerator {
    twitchClient: TwitchClient;

    constructor(twitchClient: TwitchClient) {
        this.twitchClient = twitchClient;
    }

    async fromChatMessage(msg: ChatMessage): Promise<AlertType[]> {
        const alerts: AlertType[] = [];

        alerts.push(...(await this.checkForShoutOut(msg)));

        return alerts;
    }

    async checkForShoutOut(msg: ChatMessage): Promise<ShoutoutAlertType[]> {
        const userData = await this.twitchClient.getUsers([msg.username]);
        const channelData = await this.twitchClient.getChannel(userData[0].id);
        if (userData[0].broadcaster_type === "affiliate" || userData[0].broadcaster_type === "partner") {
            return [new ShoutoutAlertType(msg, userData, channelData)];
        }
        return [];
    }
}