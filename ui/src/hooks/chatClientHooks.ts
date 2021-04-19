import { useEffect, useRef } from "react";
import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import TwitchChatClient from "../service/TwitchChatClient";
import { AppState } from "../state/AppState";

export const useTwitchChatClient = (state: AppState, dispatch: any) => {
    const chatClient = useRef(undefined as TwitchChatClient | undefined);

    useEffect(() => {
        if (state.username && state.accessToken && state.streamer) {
            chatClient.current = new TwitchChatClient(state.username, state.streamer, state.accessToken as string, (msg) => {
                dispatch({
                    type: "add_chat_message",
                    message: msg,
                });
            });
            chatClient.current.connect();
        }

        return function cleanup() {
            chatClient.current?.disconnect();
        }
    }, [state.username, state.accessToken, state.streamer]);

    return chatClient;
}

