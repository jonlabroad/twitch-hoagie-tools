export interface LoginContextType {
  state: LoginState;
  setState: (newState: LoginState) => void;
}

export const defaultLoginState: LoginState = {
  username: undefined,
  accessToken: undefined,
  isLoggedIn: false,
};

export interface LoginState {
  username?: string;
  userId?: string;
  accessToken?: string;
  isLoggedIn: boolean;
}
