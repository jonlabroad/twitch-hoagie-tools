import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import {
  TwitchPlusStatusClient,
  TwitchPlusStatusEntry,
} from '@hoagie/streamer-service';

export function useTwitchPlusData(
  broadcasterId: string | undefined,
  intervalMin?: number
): [TwitchPlusStatusEntry[] | undefined, boolean] {
  const { state: loginState } = useContext(LoginContext);
  const [data, setData] = useState<TwitchPlusStatusEntry[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(
    async (
      userId: string | undefined,
      accessToken: string | undefined,
      broadcasterId: string | undefined
    ) => {
      if (userId && accessToken && broadcasterId) {
        setIsLoading(true);
        try {
          const client = new TwitchPlusStatusClient(
            undefined,
            userId,
            accessToken
          );
          const data = await client.query(broadcasterId);

          if (data) {
            setData(data);
          }
        } finally {
          setIsLoading(false);
        }
      }
    },
    []
  );

  const pollHandle = useRef<NodeJS.Timeout | undefined>(undefined) as any;
  useEffect(() => {
    if (loginState.userId && loginState.accessToken && broadcasterId) {
      if (!pollHandle.current && intervalMin && intervalMin > 0) {
        console.log({ scheduling: intervalMin});
        pollHandle.current = setInterval(() => {
          fetchData(loginState.userId, loginState.accessToken, broadcasterId);
        }, intervalMin * 60 * 1000);
      }
    }

    return () => {
      if (pollHandle.current) {
        clearInterval(pollHandle.current);
      }
    };
  }, [
    loginState.userId,
    loginState.accessToken,
    broadcasterId,
    intervalMin,
    fetchData,
  ]);

  useEffect(() => {
    fetchData(loginState.userId, loginState.accessToken, broadcasterId);
  }, [loginState.userId, loginState.accessToken, broadcasterId]);

  return [data, isLoading];
}
