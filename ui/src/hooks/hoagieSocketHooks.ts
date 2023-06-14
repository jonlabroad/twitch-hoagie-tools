import { useContext, useEffect, useRef, useState } from "react";
import TwitchChatClient from "../service/TwitchChatClient";
import { StateContext } from "../components/context/StateContextProvider";
import { LoginContext } from "../components/context/LoginContextProvider";
import HoagieWebsocketClient from "../service/HoagieWebsocketClient";
import TwitchClient from "../service/TwitchClient";

export const useHoagieSockets = (onMessage: (msg: any) => void) => {
  const { state, dispatch } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [isConnected, setConnected] = useState(false);
  const isConnectedRef = useRef<boolean>(isConnected);
  const pingHandler = useRef<NodeJS.Timeout | undefined>(undefined);

  const socketClient = useRef(undefined as HoagieWebsocketClient | undefined);

  const ping = () => {
    try {
      console.log("hoagie ping");
      if (socketClient.current && isConnectedRef.current) {
        socketClient.current.ping();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loginState.username && loginState.accessToken && state.streamer) {
      socketClient.current = new HoagieWebsocketClient(
        (msg) => {
          onMessage(JSON.parse(msg ?? ""));
        },
        (connected) => {
          if (connected !== isConnected) {
            setConnected(connected);
            if (!connected) {
                socketClient.current?.connect();
            }
          }
        }
      );
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
        pingHandler.current = setInterval(() => ping(), 4 * 60 * 1e3);
      }
    }
    subscribe();
  }, [isConnected]);

  return [socketClient.current, isConnected];
};
