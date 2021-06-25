import { Link } from "@material-ui/core"
import React, { useContext } from "react"
import { StateContext } from "../components/MainPage";

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
