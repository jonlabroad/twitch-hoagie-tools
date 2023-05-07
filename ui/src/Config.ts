import { AlertTypeType } from "./alerts/AlertType";
import { ModActionType } from "./state/AppState";

export interface PageConfig {
    title: string
    path: string
    access: "admin" | "mod"
}

export default class Config {
    public static admins = ["hoagieman5000"]
    public static clientId = process.env.NODE_ENV === "production" ? "ywktn54es8x9ipwm0305v3sj3vmy7l" : "2tkbhgbkk81ylt5o22iqjk9c0sorcg";
    public static overlayClientId = "tc1xzzxj1ct3a3fieahi0lqrjewk75";
    public static redirectUri = process.env.NODE_ENV === "production" ? "https://hoagietools.hoagieman.net/loginRedirect" : "http://localhost:3000/loginRedirect";

    public static spotifyClientId = "7bea1548c3534971ad8bd4c34de743a7";

    public static host = process.env.NODE_ENV === "production" ? "hoagietools.hoagieman.net" : "localhost";

    //const scopes = "chat:read chat:edit"
    public static scopes = ""


    public static defaultAlertExpirySec = 10 * 60;
    public static alertExpirySec: Record<AlertTypeType, number> = {
        "shoutout": 3 * 60,
        "chat_eval": 3 * 60,
        "generic": Config.defaultAlertExpirySec,
    }

    public static defaultAlertIgnoreList = [
        "nightbot",
        "songlistbot",
        "streamlabs",
    ]

    public static modActionExpirySec: Record<ModActionType, number> = {
        "ignore_shoutout": 60 * 60,
        "ignore_chat_eval": 60 * 60,
    }

    public static minChatEvalProbability = 0.60;

    public static pages: Record<string, PageConfig> = {
        "songlistAndDono": {
            title: "Songlist and Donos",
            path: "/s/:streamer/dono",
            access: "mod"
        },
        "raid": {
            title: "Raid Candidates",
            path: "/s/:streamer/raid",
            access: "mod"
        },
        "settings": {
            title: "Settings",
            path: "/s/:streamer/config",
            access: "mod",
        },
        "streameradmin": {
            title: "Streamer Admin",
            path: "/s/:streamer/admin",
            access: "admin"
        },
        "admin": {
            title: "Admin",
            path: "/admin",
            access: "admin",
        }
    }
}
