import React from "react"
import { useConnection } from "../../hooks/connectionHooks";
import { ConnectionConfig } from "./ConnectionConfig";

export interface ConnectionRedirectProps {
  connectionConfig: ConnectionConfig;
}

export const ConnectionRedirect = (props: ConnectionRedirectProps) => {
    const { authorizationCode } = useConnection();

    return <React.Fragment>
        {authorizationCode && <div>Connection success!</div>}
        <div>Authorization code: {authorizationCode}</div>
    </React.Fragment>
}
