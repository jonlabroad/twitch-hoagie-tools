import { createContext, useContext, useEffect, useState } from "react";
import { LoginContext } from "../context/LoginContextProvider";
import { StateContext } from "./StateContextProvider";
import { ConfigClient } from "@hoagie/config-service";
import Config from "../../Config";

export interface ModListContextType {
    mods: string[]
}

export interface ModListContextProviderProps {
  children: any;
}

export const ModListContext = createContext<ModListContextType>({
    mods: []
});

export const ModListContextProvider = (props: ModListContextProviderProps) => {
    const [mods, setMods] = useState<string[]>([])
    const { state: loginState } = useContext(LoginContext)
    const { state } = useContext(StateContext)

    async function getMods(userId: string, accessToken: string, streamerId: string) {
        const client = new ConfigClient(userId, accessToken, Config.environment);
        const mods = await client.get(streamerId)
        setMods(mods?.mods)
    }

    useEffect(() => {
        if (loginState.userId && loginState.accessToken && state.streamerId) {
            getMods(loginState.userId, loginState.accessToken, state.streamerId)
        }
    }, [loginState.userId, loginState.accessToken, state.streamerId])

  return (
    <ModListContext.Provider
      value={{
        mods,
      }}
    >
      {props.children}
    </ModListContext.Provider>
  );
};
