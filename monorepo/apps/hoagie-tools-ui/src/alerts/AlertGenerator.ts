import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import TwitchClient from "../service/TwitchClient";
import { AppState } from "../state/AppState";
import AlertTrimmer from "./AlertTrimmer";
import AlertType, { createShoutoutAlert, ShoutoutAlertType } from "./AlertType";

export interface AlertContextType {
    alertGenerator?: AlertGenerator;
}

export default class AlertGenerator {
    twitchClient: TwitchClient;

    constructor(twitchClient: TwitchClient) {
        this.twitchClient = twitchClient;
    }

    async fromChatMessage(msg: ChatMessage, state: AppState): Promise<AlertType[]> {
        const alerts: AlertType[] = [];

        alerts.push(...(await this.checkForShoutOut(msg)));

        const alertsToTrim = AlertTrimmer.getAlertsToTrim(alerts, state.event.events);
        return alerts.filter(newAlert => !alertsToTrim.find(a => a.key === newAlert.key));
    }

    async checkForShoutOut(msg: ChatMessage): Promise<ShoutoutAlertType[]> {
        const userData = await this.twitchClient.getUsers([msg.username]);
        const channelData = await this.twitchClient.getChannel(userData[0].id);
        const follows = await this.twitchClient.getFollows({
            toId: userData[0].id,
        });

        if (userData[0].broadcaster_type === "affiliate" || userData[0].broadcaster_type === "partner" || msg.username === "hoagiebot5000") {
            return [createShoutoutAlert(msg, userData[0], channelData[0], follows)];
        }
        return [];
    }
}