import React, { useContext } from "react"
import Config from "../../Config";
import { StateContext } from "../MainPage";

export interface EmbeddedChatProps {
}

export const EmbeddedChat = (props: EmbeddedChatProps) => {
    const stateContext = useContext(StateContext);

    return <React.Fragment>
        {stateContext.state.streamer &&
            <iframe src={`https://www.twitch.tv/embed/${stateContext.state.streamer}/chat?parent=${Config.host}`}
                height="600"
                width="100%">
            </iframe>
        }
    </React.Fragment>
}