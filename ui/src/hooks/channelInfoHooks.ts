import { useContext, useEffect } from "react";
import TwitchClient from "../service/TwitchClient";
import { StateContextType } from "../state/AppState";
import { SetChannelInfoAction } from "../state/AppStateReducer";
import { LoginContext } from "../components/context/LoginContextProvider";

export const useChannelInfo = (streamer: string | undefined, stateContext: StateContextType) => {
    const { state: loginState } = useContext(LoginContext)

    useEffect(() => {
        async function getChannelInfo() {
            if (streamer && loginState.accessToken) {
                const twitchClient = new TwitchClient(loginState.accessToken)
                const userData = await twitchClient.getUsers([streamer]);
                const streamData = await twitchClient.getStreamsByUsernames([streamer]);
                stateContext.dispatch({
                    type: "set_channel_info",
                    userData: userData[0],
                    streamData: streamData[0],
                } as SetChannelInfoAction);
            }
        }
        getChannelInfo();
    }, [streamer, loginState.accessToken]);
}
