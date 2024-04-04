import { createContext } from "react";
import { UserData } from "@hoagie/service-clients";
import { useTwitchUserData } from "../../hooks/twitchUserData";

export interface TwitchUserInfoProviderProps {
  children: any;
}

export interface TwitchUserInfoContextType {
  addUsers: ((userLogins: string[]) => void) | undefined;
  userData: Record<string, UserData>;
}

export const TwitchUserInfoContext = createContext<TwitchUserInfoContextType>({
  addUsers: undefined,
  userData: {},
});

export const TwitchUserInfoProvider = (props: TwitchUserInfoProviderProps) => {
  const { userData, addUsers } = useTwitchUserData({
    initialUsers: [],
  });

  return (
    <TwitchUserInfoContext.Provider
      value={{
        addUsers,
        userData,
      }}
    >
      {props.children}
    </TwitchUserInfoContext.Provider>
  );
};
