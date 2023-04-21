import { Card } from "@mui/material";
import React, { useContext } from "react"
import { StateContext } from "../components/MainPage";
import Config from "../Config";

export interface EmbeddedVideoProps {

}

export const EmbeddedVideo = (props: EmbeddedVideoProps) => {
    const stateContext = useContext(StateContext);
    
    return <React.Fragment>
        <Card>
            {stateContext.state.streamer && <iframe
                src={`https://player.twitch.tv/?channel=${stateContext.state.streamer}&parent=${Config.host}`}
                width="100%"
                height="300px"
                allowFullScreen={false}>
            </iframe>}
        </Card>
    </React.Fragment>
}