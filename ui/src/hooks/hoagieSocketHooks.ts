import { useContext, useEffect, useRef, useState } from "react";
import TwitchChatClient from "../service/TwitchChatClient";
import { StateContext } from "../components/context/StateContextProvider";
import { LoginContext } from "../components/context/LoginContextProvider";
import HoagieWebsocketClient from "../service/HoagieWebsocketClient";
import TwitchClient from "../service/TwitchClient";
import { HoagieSocketEventListener } from "../service/HoagieSocketEventListener";

export const useHoagieSockets = (onDono: (msg: any) => void) => {
  const { state, dispatch } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [isConnected, setConnected] = useState(false);
  const isConnectedRef = useRef<boolean>(isConnected);
  const pingHandler = useRef<NodeJS.Timeout | undefined>(undefined);

  const socketClient = useRef(undefined as HoagieSocketEventListener | undefined);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected])

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
    if (loginState.username && loginState.accessToken && state.streamer) {
      socketClient.current = new HoagieSocketEventListener();
      socketClient.current.addListener("connect", () => setConnected(true));
      socketClient.current.addListener("disconnect", () => setConnected(false));
      socketClient.current.addListener("dono", onDono);
      socketClient.current.connect();
    }

    return function cleanup() {
      socketClient.current?.disconnect();
    };
  }, [loginState.username, loginState.accessToken, state.streamer]);

  useEffect(() => {
    async function subscribe() {
      if (isConnected) {
        console.log("Subscribing");
        const broadcasterId = await new TwitchClient(
          loginState.accessToken!
        ).getUserId(state.streamer!);
        if (broadcasterId) {
          socketClient.current?.subscribeDono(broadcasterId);
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
