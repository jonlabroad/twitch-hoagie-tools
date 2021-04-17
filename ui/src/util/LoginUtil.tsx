export interface SessionData {
    username: string
    accessToken: string
    tokenType: string
}

export default class LoginUtil {
    public static saveSessionData(username: string, accessToken: string, tokenType: string) {
        const storage = window.localStorage;
        storage.setItem("StreamerSongQueue_Username", username)
        storage.setItem("StreamerSongQueue_TwitchToken", accessToken);
        storage.setItem("StreamerSongQueue_TokenType", tokenType);
    }

    public static getSessionData(): SessionData {
        const storage = window.localStorage;
        return {
            username: storage.getItem("StreamerSongQueue_Username") ?? "",
            accessToken: storage.getItem("StreamerSongQueue_TwitchToken") ?? "",
            tokenType: storage.getItem("StreamerSongQueue_TokenType") ?? ""
        }
    }
}