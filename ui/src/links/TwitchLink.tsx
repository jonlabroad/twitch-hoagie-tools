import { Link } from "@mui/material"
import React, { useContext } from "react"
import { StateContext } from "../components/MainPage";

export interface NightbotCommandsLinkProps {

}

export const NightbotCommandsLink = (props: NightbotCommandsLinkProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>{stateContext.state.streamer &&
        <Link style={{ fontSize: 12 }} href={`https://nightbot.tv/t/${stateContext.state.streamer?.toLowerCase()}/commands`} target="_blank">
            Nightbot
        </Link>}
    </React.Fragment>
}
