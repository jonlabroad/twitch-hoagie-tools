import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import Config from "../Config";
import { useLogin } from "../hooks/loginHooks";
import LoginUtil from "../util/LoginUtil";
import { DarkModeSwitch } from "./DarkModeSwitch";
import { FlexRow } from "./util/FlexBox";
import { HeaderMenu } from "./menu/HeaderMenu";
import { useContext } from "react";
import { LoginContext } from "./context/LoginContextProvider";
import { StateContext } from "./context/StateContextProvider";
import { StreamerInfo } from "./menu/StreamerInfo";

export const PageHeader = (props: { scopes: string; clientId: string }) => {
  const { scopes } = props;

  const { state } = useContext(StateContext);

  const loginContext = useContext(LoginContext);
  const { state: loginState, setState: setLoginState } = loginContext;

  const [] = useLogin(
    (
      username: string | undefined,
      accessToken: string,
      isLoggedIn: boolean
    ) => {
      if (username) {
        setLoginState({
          username,
          accessToken,
          isLoggedIn,
        });
      }
    }
  );

  return (
    <AppBar position="static" enableColorOnDark>
      <Toolbar variant="dense">
        <FlexRow>
          <div>
            <HeaderMenu />
          </div>
        </FlexRow>
        <FlexRow
          style={{ width: "100%" }}
          justifyContent="space-between"
          alignItems="center"
        >
          <FlexRow>
            <Typography variant="h6" style={{ marginRight: "20px" }}>
              Hoagie Tools
            </Typography>
            {state.streamerData && (
              <FlexRow>
                <StreamerInfo />
              </FlexRow>
            )}
          </FlexRow>
          {loginState.isLoggedIn ? (
            <FlexRow alignItems="center">
              <DarkModeSwitch />
              <div>{loginState.username}</div>
              <Button
                style={{
                  marginLeft: 10,
                }}
                variant="contained"
                color="secondary"
                onClick={() => LoginUtil.logout()}
              >
                Log Out
              </Button>
            </FlexRow>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              href={`https://id.twitch.tv/oauth2/authorize?scope=${scopes}&client_id=${props.clientId}&redirect_uri=${Config.redirectUri}&response_type=token`}
            >
              Login
            </Button>
          )}
        </FlexRow>
      </Toolbar>
    </AppBar>
  );
};
