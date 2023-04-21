import { Link } from "@mui/material"
import React, { useContext } from "react"
import { StateContext } from "../components/MainPage";

export interface SonglistLinkProps {

}

export const SonglistLink = (props: SonglistLinkProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>{stateContext.state.streamer &&
        <Link style={{ fontSize: 12 }} href={`https://www.streamersonglist.com/t/${stateContext.state.streamer?.toLowerCase()}/songs`} target="_blank">
            Songlist
        </Link>}
    </React.Fragment>
}
