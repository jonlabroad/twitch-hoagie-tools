import { useContext } from "react";
import { StateContext } from "../../context/StateContextProvider";
import { LoginContext } from "../../context/LoginContextProvider";

export const TokenConfigContainer = () => {
  const { state: appState } = useContext(StateContext);
  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;


}
