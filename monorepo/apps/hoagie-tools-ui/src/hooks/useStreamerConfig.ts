import { useState, useEffect, useContext, useCallback } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import {
  StreamerConfigClient,
  StreamerConfigData,
} from '@hoagie/streamer-service';

export function useStreamerConfig(
  broadcasterId: string | undefined
): [StreamerConfigData | undefined, (data: StreamerConfigData) => void] {
  const { state: loginState } = useContext(LoginContext);
  const [data, setData] = useState<StreamerConfigData | undefined>(undefined);

  useEffect(() => {
    async function getStreamHistory() {
      if (loginState.userId && loginState.accessToken && broadcasterId) {
        const client = new StreamerConfigClient(
          undefined,
          loginState.userId,
          loginState.accessToken
        );
        const data = await client.get(broadcasterId);
        if (data) {
          setData(data);
        }
      }
    }
    getStreamHistory();
  }, [loginState.userId, loginState.accessToken, broadcasterId]);

  const saveData = useCallback(async (newData: StreamerConfigData) => {
    if (loginState.userId && loginState.accessToken && broadcasterId) {
      const client = new StreamerConfigClient(
        undefined,
        loginState.userId,
        loginState.accessToken
      );
      await client.set(broadcasterId, newData);
      setData(newData);
    }
  }, [loginState.userId, loginState.accessToken, broadcasterId, data]);

  return [data, saveData];
}
