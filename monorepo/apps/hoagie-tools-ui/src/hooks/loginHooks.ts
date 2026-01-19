import qs from "qs";
import { useEffect } from "react";
import LoginUtil from "../util/LoginUtil";
import { TwitchClient } from "@hoagie/service-clients";

export function useLogin(setLogin: (username: string | undefined, userId: string | undefined, accessToken: string, loggedIn: boolean) => void) {
    useEffect(() => {
        async function login() {
            const sessionData = LoginUtil.getSessionData();
            if (window.location.hash) {
                // User redirected from Twitch oauth
                const parsed = qs.parse(window.location.hash.replace('#', ''));

                const validatedSession = await TwitchClient.validateSession(parsed.access_token as string);
                if (validatedSession.validated) {
                    LoginUtil.saveSessionData(validatedSession?.validatedSession?.login ?? "", parsed.access_token as string, parsed.token_type as string);
                }
                setLogin(validatedSession?.validatedSession?.login, validatedSession?.validatedSession?.user_id, parsed.access_token as string, validatedSession?.validated ?? false);
            } else if (sessionData && sessionData.accessToken) {
                // Validate with the Twitch API, reset the session if it is no longer valid
                const validatedSession = await TwitchClient.validateSession(sessionData.accessToken);
                setLogin(validatedSession?.validatedSession?.login, validatedSession?.validatedSession?.user_id, sessionData.accessToken, validatedSession?.validated ?? false);
            }
        }
        login();
    }, []);

    return [];
}

export function useYoutubeLogin(setLogin: (username: string | undefined, userId: string | undefined, accessToken: string, loggedIn: boolean) => void) {
    useEffect(() => {
        async function login() {
            const sessionData = LoginUtil.getSessionData();
            if (window.location.hash) {
                // User redirected from Youtube oauth
                const parsed = qs.parse(window.location.hash.replace('#', ''));
                console.log({ parsed });
                // TODO validate Youtube session and save session data
            } else if (sessionData && sessionData.accessToken) {
                // Validate with the Youtube API, reset the session if it is no longer valid
            }
        }
        login();
    }, []);

    return [];
}

