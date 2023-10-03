import { createContext, useState } from "react";
import { LoginContextType, LoginState, defaultLoginState } from "../../state/LoginState";

export interface LoginContextProviderProps {
  children: any;
}

export const LoginContext = createContext<LoginContextType>({
  state: defaultLoginState,
  setState: () => {}
});

export const LoginContextProvider = (props: LoginContextProviderProps) => {
    const [state, setState] = useState<LoginState>(defaultLoginState)

  return (
    <LoginContext.Provider
      value={{
        state,
        setState,
      }}
    >
      {props.children}
    </LoginContext.Provider>
  );
};
