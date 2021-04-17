import React from "react";
import { FlexCol, FlexRow } from "../util/FlexBox";

export interface ChatMessage {
    username: string
    message: string
    timestamp: Date
}

export interface SimpleChatDisplayProps {
    messages: ChatMessage[]
}

export const SimpleChatDisplay = (props: SimpleChatDisplayProps) => {
    const { messages } = props;

    return <FlexCol>
        Chat
        {messages.map((msg, i) => <FlexRow key={i}>
                <div>{msg.username}</div>
                <div>{msg.message}</div>
            </FlexRow>
        )}
    </FlexCol>
    
}