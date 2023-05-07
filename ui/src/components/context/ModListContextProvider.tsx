import { createContext, useContext, useEffect, useState } from "react";
import { LoginContext } from "../context/LoginContextProvider";
import HoagieClient from "../../service/HoagieClient";
import { StateContext } from "./StateContextProvider";

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

    async function getMods(username: string, accessToken: string, streamerName: string) {
        const client = new HoagieClient()
        const mods = await client.getMods(username, accessToken, streamerName)
        setMods(mods?.mods)
    }
    
    useEffect(() => {
        if (loginState.username && loginState.accessToken && state.streamer) {
            getMods(loginState.username, loginState.accessToken, state.streamer)
        }
    }, [loginState.username, loginState.accessToken, state.streamer])

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
