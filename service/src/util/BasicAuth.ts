import atob from "atob";

export namespace BasicAuth {
    export function decode(authHeader: string) {
        const decoded = atob(authHeader.replace("Basic ", ""));
        console.log({decoded})
        const usernameToken = decoded.split(":")
        return {
            username: usernameToken[0],
            token: usernameToken[1]
        }
    }
}