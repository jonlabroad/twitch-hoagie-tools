import { AlertTypeType } from "./alerts/AlertType";
import { ModActionType } from "./state/AppState";

export default class Config {
    public static defaultAlertExpirySec = 10 * 60;
    public static alertExpirySec: Record<AlertTypeType, number>  = {
        "shoutout": 3 * 60,
        "generic": Config.defaultAlertExpirySec,
    }

    public static defaultAlertIgnoreList = [
        "nightbot",
        "songlistbot",
    ]

    public static modActionExpirySec: Record<ModActionType, number> = {
        "ignore_shoutout": 60 * 60,
    }
}
