import { useContext } from "react"
import { FlexRow } from "../util/FlexBox"

import "../../styles/Menu.scss"
import { Typography } from "@mui/material"
import { StateContext } from "../context/StateContextProvider"

export interface StreamerInfoProps {

}

export const StreamerInfo = (props: StreamerInfoProps) => {
    const { state } = useContext(StateContext)

    return <>
        <FlexRow justifyContent="center" alignItems="center">
            <div className="menu-channel-avatar">
                <img src={state.streamerData?.userData?.profile_image_url} />
            </div>
            <Typography>{state.streamerData?.userData?.display_name ?? state.streamer ?? "..."}</Typography>
        </FlexRow>
    </>
}