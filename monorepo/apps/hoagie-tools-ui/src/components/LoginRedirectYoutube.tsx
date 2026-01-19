import React, { useContext, useEffect, useState } from "react"
import { useLogin } from "../hooks/loginHooks";
import { LoginAction } from "../state/AppStateReducer";
import LocalStorage from "../util/LocalStorage";

export interface LoginRedirectYoutubeProps {}

export const LoginRedirectYoutube = (props: LoginRedirectYoutubeProps) => {
    const [loggedIn, setLoggedIn] = useState(false);

    useYoutubeLogin((username: string | undefined, userId: string | undefined, accessToken: string, isLoggedIn: boolean) => {
        if (username) {
            setLoggedIn(isLoggedIn);
        }
    });

    useEffect(() => {
        if (loggedIn) {
            const pathString = LocalStorage.get("lastPath");
            if (pathString) {
                const path = JSON.parse(pathString);
                const hostname = window.location.hostname;
                const protocol = window.location.protocol;
                let port = `:${window.location.port}`;
                if (port === ":80" || port == ":443") {
                    port = "";
                }

                const url = `${protocol}//${hostname}${port}${path.path}`;
                console.log(`Redirecting to ${url}`);
                window.location.replace(url);
            }
        }
    }, [loggedIn]);

    return <React.Fragment>
        <div></div>
    </React.Fragment>
}
