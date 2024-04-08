import { useContext, useEffect, useRef, useState } from 'react';
import { StateContext } from '../components/context/StateContextProvider';
import { LoginContext } from '../components/context/LoginContextProvider';
import { HoagieSocketEventListener } from '../service/HoagieSocketEventListener';
import { createTwitchClient } from '../util/CreateTwitchClient';

const defaultOptions = {
  doSubscribe: true,
};

export const useHoagieSockets = (
  onDono: (msg: any) => void,
  options: {
    doSubscribe: boolean;
  } = defaultOptions
): [HoagieSocketEventListener | undefined, boolean] => {
  const { state, dispatch } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [isConnected, setConnected] = useState(false);
  const isConnectedRef = useRef<boolean>(isConnected);
  const pingHandler = useRef<NodeJS.Timeout | undefined>(undefined);

  const socketClient = useRef(
    undefined as HoagieSocketEventListener | undefined
  );

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const ping = () => {
    try {
      if (socketClient.current && isConnectedRef.current) {
        socketClient.current.ping();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loginState.username && loginState.accessToken) {
      socketClient.current = new HoagieSocketEventListener();
      socketClient.current.addListener('connect', () => setConnected(true));
      socketClient.current.addListener('disconnect', () => setConnected(false));
      socketClient.current.addListener('dono', onDono);
      socketClient.current.connect();
    }

    return function cleanup() {
      socketClient.current?.disconnect();
    };
  }, [loginState.username, loginState.accessToken]);

  useEffect(() => {
    async function subscribe() {
      if (options.doSubscribe && isConnected && state.streamer && loginState.accessToken) {
        if (state.streamerId) {
          socketClient.current?.subscribeDono(state.streamerId);
        }

        if (pingHandler.current) {
          clearInterval(pingHandler.current);
        }
        pingHandler.current = setInterval(() => ping(), 3 * 60 * 1e3);
      }
    }
    subscribe();
  }, [isConnected]);

  return [socketClient.current, isConnected];
};
