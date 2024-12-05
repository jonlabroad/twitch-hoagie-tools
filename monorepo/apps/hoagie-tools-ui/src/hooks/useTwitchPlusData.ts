import { useState, useEffect, useContext, useCallback } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { TwitchPlusStatusClient, TwitchPlusStatusEntry } from '@hoagie/streamer-service';

export function useTwitchPlusData(
  broadcasterId: string | undefined
): [TwitchPlusStatusEntry[] | undefined] {
  const { state: loginState } = useContext(LoginContext);
  const [data, setData] = useState<TwitchPlusStatusEntry[] | undefined>(undefined);

  useEffect(() => {
    async function fetch() {
      if (loginState.userId && loginState.accessToken && broadcasterId) {
        const client = new TwitchPlusStatusClient(
          undefined,
          loginState.userId,
          loginState.accessToken
        );
        const data = await client.query(broadcasterId);
        console.log({ data });
        if (data) {
          setData(data);
        }
      }
    }
    fetch();
  }, [loginState.userId, loginState.accessToken, broadcasterId]);

  return [data];
}
