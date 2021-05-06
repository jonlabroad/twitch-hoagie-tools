import React, { useContext } from "react"
import { StateContext } from "./MainPage";
import { FlexCol, FlexRow } from "./util/FlexBox"
import MessageIcon from '@material-ui/icons/Message';

import "../styles/ChannelHeader.scss";
import { LiveIcon } from "./LiveIcon";

export interface ChannelHeaderProps {

}

export const ChannelHeader = (props: ChannelHeaderProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>
        <FlexRow alignItems="center">
            <div className="channel-avatar">
                <img src={stateContext.state.streamerData?.userData?.profile_image_url} />
            </div>
            <FlexCol>
                <FlexRow alignItems="center">
                <div className="channel-name">
                    {stateContext.state.streamerData?.userData?.display_name}
                </div>
                <LiveIcon visible={stateContext.state.streamerData?.streamData?.type === "live"}/>
                </FlexRow>
                <FlexRow className="channel-chat-connection">
                    <MessageIcon style={{color: stateContext.state.chat.connected ? "green" : "red"}}/>
                    <div>
                        {(stateContext.state.chat.connected ? "Connected to " : "Disconnected from ") + "chat"}
                    </div>
                </FlexRow>
            </FlexCol>
        </FlexRow>
    </React.Fragment>
}