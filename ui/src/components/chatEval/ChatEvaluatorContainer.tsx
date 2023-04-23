import { Grid } from "@mui/material";
import React, { useContext } from "react"
import { useChatEvaluator } from "../../hooks/chatModHooks";
import TwitchClient from "../../service/TwitchClient";
import { ChatMessage } from "../chat/SimpleChatDisplay";
import { StateContext } from "../context/StateContextProvider";

export interface ChatEvaluatorContainerProps {
    lastMessage?: ChatMessage
    twitchClient: TwitchClient | undefined
}

export const ChatEvaluatorContainer = (props: ChatEvaluatorContainerProps) => {
    const { lastMessage, twitchClient } = props;

    const stateContext = useContext(StateContext);
    useChatEvaluator(stateContext, lastMessage, twitchClient);

    return <React.Fragment>
        <Grid item xs={4}>

        </Grid>
    </React.Fragment>
}