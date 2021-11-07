import { useEffect } from "react";
import TwitchClient from "../service/TwitchClient";
import { StateContextType } from "../state/AppState";
import { SetChannelInfoAction } from "../state/AppStateReducer";

export const useChannelInfo = (streamer: string | undefined, stateContext: StateContextType) => {
    useEffect(() => {
        async function getChannelInfo() {
            if (streamer && stateContext.state.accessToken) {
                const twitchClient = new TwitchClient(stateContext.state.accessToken)
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
    }, [streamer, stateContext.state.accessToken]);
}
