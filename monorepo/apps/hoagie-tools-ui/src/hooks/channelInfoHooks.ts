import { useContext, useEffect } from 'react';
import { StateContextType } from '../state/AppState';
import { SetChannelInfoAction } from '../state/AppStateReducer';
import { LoginContext } from '../components/context/LoginContextProvider';
import { createTwitchClient } from '../util/CreateTwitchClient';

export const useChannelInfo = (
  streamerId: string | undefined,
  stateContext: StateContextType
) => {
  const { state: loginState } = useContext(LoginContext);

  useEffect(() => {
    async function getChannelInfo() {
      if (streamerId && loginState.accessToken) {
        const twitchClient = createTwitchClient(loginState.accessToken);
        const userData = (await twitchClient.getUserDataById([streamerId]))?.[0];
        const streamData = (await twitchClient.getStreamsByUserId([streamerId]))?.[0];
        if (userData) {
          stateContext.dispatch({
            type: 'set_channel_info',
            userData: userData,
            streamData: streamData,
          } as SetChannelInfoAction);
        }
      }
    }
    getChannelInfo();
  }, [streamerId, loginState.accessToken]);
};
