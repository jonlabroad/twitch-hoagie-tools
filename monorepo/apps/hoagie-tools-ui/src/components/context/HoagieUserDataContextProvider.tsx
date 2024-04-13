import { createContext, useContext, useEffect, useState } from "react";
import { LoginContext } from "./LoginContextProvider";
import { ConfigClient, UserData } from "@hoagie/config-service";
import Config from "../../Config";

export interface HoagieUserDataContextType {
    userData: UserData | undefined;
}

export interface HoagieUserDataContextProviderProps {
  children: any;
}

export const HoagieUserDataContext = createContext<HoagieUserDataContextType>({
    userData: undefined
});

export const HoagieUserDataContextProvider = (props: HoagieUserDataContextProviderProps) => {
    const [userData, setUserData] = useState<UserData | undefined>(undefined)
    const { state: loginState } = useContext(LoginContext)

    async function getuserData(userId: string, accessToken: string) {
        const client = new ConfigClient(userId, accessToken, Config.environment);
        // TODO this should be cached in memory until page reload
        const userData = await client.getUserData(userId);
        if (userData) {
          console.log({ userData });
          setUserData(userData)
        }
    }

    useEffect(() => {
        if (loginState.userId && loginState.accessToken) {
            getuserData(loginState.userId, loginState.accessToken)
        }
    }, [loginState.userId, loginState.accessToken])

  return (
    <HoagieUserDataContext.Provider
      value={{
        userData,
      }}
    >
      {props.children}
    </HoagieUserDataContext.Provider>
  );
};
