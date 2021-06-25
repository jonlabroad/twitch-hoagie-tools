import React from "react"
import { TwitchLink } from "../links/NightbotLink"
import { SonglistLink } from "../links/SonglistLink"
import { NightbotCommandsLink } from "../links/TwitchLink"
import { FlexCol } from "./util/FlexBox"

export interface StreamerLinksProps {

}

export const StreamerLinks = (props: StreamerLinksProps) => {
    return <React.Fragment>
        <FlexCol style={{ marginTop: 10 }}>
            <TwitchLink />
            <NightbotCommandsLink />
            <SonglistLink />
        </FlexCol>
    </React.Fragment>
}