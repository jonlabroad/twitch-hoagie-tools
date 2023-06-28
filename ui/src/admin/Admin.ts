import Config from "../Config";
import { LoginState } from "../state/LoginState";

export namespace Admin {
  export function isAdmin(loginState: LoginState) {
    const isAdmin =
      loginState.username &&
      loginState.isLoggedIn &&
      Config.admins
        .map((m) => m.toLowerCase())
        .includes(loginState.username.toLowerCase());

    return isAdmin;
  }
}
