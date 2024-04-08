import { AppBar, Button, Hidden, Toolbar, Typography } from "@mui/material";
import Config from "../Config";
import { useLogin } from "../hooks/loginHooks";
import LoginUtil from "../util/LoginUtil";
import { FlexRow } from "./util/FlexBox";
import { HeaderMenu } from "./menu/HeaderMenu";
import { useContext } from "react";
import { LoginContext } from "./context/LoginContextProvider";
import { StateContext } from "./context/StateContextProvider";
import { StreamerInfo } from "./menu/StreamerInfo";

const getStreamerScopes = false;

export const PageHeader = (props: { scopes: string; clientId: string }) => {
  const { scopes } = props;

  const { state } = useContext(StateContext);

  const loginContext = useContext(LoginContext);
  const { state: loginState, setState: setLoginState } = loginContext;

  // HACK!!!
  const additionalScopes = getStreamerScopes ? "channel:read:subscriptions bits:read" : [];

  const [] = useLogin(
    (
      username: string | undefined,
      userId: string | undefined,
      accessToken: string,
      isLoggedIn: boolean
    ) => {
      if (username) {
        setLoginState({
          username,
          userId,
          accessToken,
          isLoggedIn,
        });
      }
    }
  );

  return (
    <AppBar style={{ marginBottom: 10 }} position="static" enableColorOnDark>
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
              HoagieTools
            </Typography>
            {state.streamerData && (
              <Hidden smDown>
                <FlexRow>
                  <StreamerInfo />
                </FlexRow>
              </Hidden>
            )}
          </FlexRow>
          {loginState.isLoggedIn ? (
            <FlexRow alignItems="center">
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
              href={`https://id.twitch.tv/oauth2/authorize?scope=${scopes}${additionalScopes}&client_id=${props.clientId}&redirect_uri=${Config.redirectUri}&response_type=token`}
            >
              Login
            </Button>
          )}
        </FlexRow>
      </Toolbar>
    </AppBar>
  );
};
