import Config from "../Config";
import StreamEvent, { ShoutoutStreamEvent } from "../events/StreamEvent";
import { AppState } from "../state/AppState";
import AlertType, { ShoutoutAlertType } from "./AlertType";

export default class AlertTrimmer {
    static getAlertsToTrim(alerts: AlertType[], events: StreamEvent[]): AlertType[] {
        let alertsToTrim = [];
        alertsToTrim.push(...this.trimShoutouts(alerts, events));
        alertsToTrim.push(...this.trimByExpiry(alerts));

        return alertsToTrim;
    }

    static trimShoutouts(alerts: AlertType[], events: StreamEvent[]): AlertType[] {
        const toTrim: AlertType[] = [];
        const shoutoutEvents = events.filter(ev => ev.type === "shoutout") as ShoutoutStreamEvent[];
        alerts.forEach(alert => {
            if (alert.type === "shoutout") {              
                const shoutoutAlert = alert as ShoutoutAlertType;
                const shoutoutEvent = shoutoutEvents.find(ev => ev.username === shoutoutAlert.message?.username);
                if (shoutoutEvent) {
                    toTrim.push(shoutoutAlert);
                }
            }
        });
        return toTrim;
    }

    static trimByExpiry(alerts: AlertType[]): AlertType[] {
        const currDate = new Date();
        const toTrim: AlertType[] = [];
        alerts.forEach(alert => {
            const maxAgeMs = (Config.alertExpirySec[alert.type] ?? Config.defaultAlertExpirySec) * 1e3;
            const timestamp = alert.timestamp ? new Date(alert.timestamp) : new Date();
            const ageMs = currDate.getTime() - timestamp.getTime();
            if (ageMs > maxAgeMs) {
                toTrim.push(alert);
            }
        });
        return toTrim;
    }
}