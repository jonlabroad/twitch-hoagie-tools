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

    async function getMods(userId: string, accessToken: string, streamerId: string) {
        const client = new HoagieClient()
        const mods = await client.getMods(userId, accessToken, streamerId)
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
