export interface SessionData {
    username: string
    accessToken: string
    tokenType: string
}

export default class LoginUtil {
    public static saveSessionData(username: string, accessToken: string, tokenType: string) {
        const storage = window.localStorage;
        storage.setItem("HoagieTools_Username", username)
        storage.setItem("HoagieTools_TwitchToken", accessToken);
        storage.setItem("HoagieTools_TokenType", tokenType);
    }

    public static getSessionData(): SessionData {
        const storage = window.localStorage;
        return {
            username: storage.getItem("HoagieTools_Username") ?? "",
            accessToken: storage.getItem("HoagieTools_TwitchToken") ?? "",
            tokenType: storage.getItem("HoagieTools_TokenType") ?? ""
        }
    }

    public static logout() {
        const storage = window.localStorage;
        storage.removeItem("HoagieTools_Username");
        storage.removeItem("HoagieTools_TwitchToken");
        storage.removeItem("HoagieTools_TokenType");
        window.location.reload();
    }
}