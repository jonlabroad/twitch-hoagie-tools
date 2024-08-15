import { useContext, useEffect, useRef } from "react";
import TwitchChatClient from "../service/TwitchChatClient";
import { StateContext } from "../components/context/StateContextProvider";
import { LoginContext } from "../components/context/LoginContextProvider";

export const useTwitchChatClient = () => {
    const { state, dispatch } = useContext(StateContext)
    const { state: loginState } = useContext(LoginContext)

    const chatClient = useRef(undefined as TwitchChatClient | undefined);

    useEffect(() => {
        if (loginState.username && loginState.accessToken && state.streamer) {
            chatClient.current = new TwitchChatClient(loginState.username, state.streamer, loginState.accessToken as string,
                (msg) => {
                    dispatch({
                        type: "add_chat_message",
                        message: msg,
                    });
                },
                (connected) => {
                    dispatch({
                        type: "set_chat_connection",
                        connected
                    });
                }
            );
            console.log("Connecting chat client");
            chatClient.current.connect();
        }

        return function cleanup() {
            chatClient.current?.disconnect();
        }
    }, [loginState.username, loginState.accessToken, state.streamer]);

    return chatClient;
}

