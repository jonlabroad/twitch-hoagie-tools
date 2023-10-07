import qs from "qs";
import { useEffect } from "react";
import TwitchClient from "../service/TwitchClientOld";
import LoginUtil from "../util/LoginUtil";

export function useLogin(setLogin: (username: string | undefined, accessToken: string, loggedIn: boolean) => void) {
    useEffect(() => {
        async function login() {
            const sessionData = LoginUtil.getSessionData();
            if (window.location.hash) {
                // User redirected from Twitch oauth
                const parsed = qs.parse(window.location.hash.replace('#', ''));

                const twitchClient = new TwitchClient(parsed.access_token as string);
                const validatedSession = await twitchClient.validateSession();
                if (validatedSession.validated) {
                    LoginUtil.saveSessionData(validatedSession?.validatedSession?.login ?? "", parsed.access_token as string, parsed.token_type as string);
                }
                setLogin(validatedSession?.validatedSession?.login, parsed.access_token as string, validatedSession?.validated ?? false);
            } else if (sessionData && sessionData.accessToken) {
                // Validate with the Twitch API, reset the session if it is no longer valid
                const twitchClient = new TwitchClient(sessionData.accessToken);
                const validatedSession = await twitchClient.validateSession();
                setLogin(validatedSession?.validatedSession?.login, sessionData.accessToken, validatedSession?.validated ?? false);
            }
        }
        login();
    }, []);

    return [];
}

