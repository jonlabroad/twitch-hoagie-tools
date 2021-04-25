import React, { useContext } from "react"
import { StateContext } from "./MainPage";
import { FlexCol, FlexRow } from "./util/FlexBox"
import MessageIcon from '@material-ui/icons/Message';

import "../styles/ChannelHeader.scss";

export interface ChannelHeaderProps {

}

export const ChannelHeader = (props: ChannelHeaderProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>
        <FlexRow alignItems="center">
            <div className="channel-avatar">
                <img src={stateContext.state.streamerData?.profile_image_url} />
            </div>
            <FlexCol>
                <div className="channel-name">
                    {stateContext.state.streamerData?.display_name}
                </div>
                <FlexRow className="channel-chat-connection">
                    <MessageIcon style={{color: stateContext.state.chat.connected ? "green" : "red"}}/>
                    <div>
                        {stateContext.state.chat.connected ? "Connected" : "Disconnected"}
                    </div>
                </FlexRow>
            </FlexCol>
        </FlexRow>
    </React.Fragment>
}