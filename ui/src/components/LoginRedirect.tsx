import React, { useContext, useEffect, useState } from "react"
import { useLogin } from "../hooks/loginHooks";
import { LoginAction } from "../state/AppStateReducer";
import LocalStorage from "../util/LocalStorage";

export interface LoginRedirectProps {

}

export const LoginRedirect = (props: LoginRedirectProps) => {
    const [loggedIn, setLoggedIn] = useState(false);

    const [] = useLogin((username: string | undefined, accessToken: string, isLoggedIn: boolean) => {
        console.log({username})
        if (username) {
            setLoggedIn(isLoggedIn);
        }
    });

    useEffect(() => {
        if (loggedIn) {
            const pathString = LocalStorage.get("lastPath");
            console.log({loggedIn, pathString})
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