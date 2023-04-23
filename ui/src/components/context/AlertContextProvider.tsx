import { createContext, useContext, useEffect, useRef } from "react";
import AlertGenerator, { AlertContextType } from "../../alerts/AlertGenerator";
import TwitchClient from "../../service/TwitchClient";
import { StateContext } from "./StateContextProvider";
import CacheManager from "../../util/CacheManager";
import { LoginContext } from "./LoginContextProvider";

export const AlertContext = createContext<AlertContextType>({
  alertGenerator: undefined,
});

export const AlertContextProvider = (props: { children: any }) => {
  const alertGenerator = useRef<AlertGenerator | undefined>(undefined);
  const twitchClient = useRef<TwitchClient | undefined>(undefined);
  const caches = useRef(new CacheManager());
  
  const { state: loginState } = useContext(LoginContext);

  useEffect(() => {
    if (loginState.accessToken && !twitchClient.current) {
      const client = new TwitchClient(loginState.accessToken, caches.current);
      twitchClient.current = client;
      alertGenerator.current = new AlertGenerator(client);
    }
  }, [loginState.accessToken]);

  return (
    <AlertContext.Provider
      value={{
        alertGenerator: alertGenerator.current,
      }}
    >
      {props.children}
    </AlertContext.Provider>
  );
};
