import { Link } from "@mui/material"
import React, { useContext } from "react"
import { StateContext } from "../components/context/StateContextProvider";

export interface TwitchLinkProps {

}

export const TwitchLink = (props: TwitchLinkProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>{stateContext.state.streamer &&
        <Link style={{ fontSize: 12 }} href={`https://twitch.tv/${stateContext.state.streamer?.toLowerCase()}`} target="_blank">
            Twitch
        </Link>}
    </React.Fragment>
}
