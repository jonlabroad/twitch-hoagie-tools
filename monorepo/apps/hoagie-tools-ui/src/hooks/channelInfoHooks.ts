import { useContext, useEffect } from 'react';
import { StateContextType } from '../state/AppState';
import { SetChannelInfoAction } from '../state/AppStateReducer';
import { LoginContext } from '../components/context/LoginContextProvider';
import { createTwitchClient } from '../util/CreateTwitchClient';

export const useChannelInfo = (
  streamer: string | undefined,
  stateContext: StateContextType
) => {
  const { state: loginState } = useContext(LoginContext);

  useEffect(() => {
    async function getChannelInfo() {
      if (streamer && loginState.accessToken) {
        const twitchClient = createTwitchClient(loginState.accessToken);
        const userData = await twitchClient.getUserData(streamer);
        const streamData = await twitchClient.getStreamsByUsernames([streamer]);
        if (userData) {
          stateContext.dispatch({
            type: 'set_channel_info',
            userData: userData,
            streamData: streamData[0],
          } as SetChannelInfoAction);
        }
      }
    }
    getChannelInfo();
  }, [streamer, loginState.accessToken]);
};
