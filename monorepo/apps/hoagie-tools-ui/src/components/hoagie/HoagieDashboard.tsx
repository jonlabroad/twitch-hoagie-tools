import {
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import React, { useContext, useEffect, useReducer, useState } from "react";

import "../../styles/StreamerDashboard.scss";

import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/Link";
import { AppState, defaultAppState } from "../../state/AppState";
import { TwitchSubscription } from "../../service/TwitchClientTypes";
import { appStateReducer } from "../../state/AppStateReducer";
import HoagieOverlayClient from "../../service/HoagieOverlayClient";
import LocalStorage from "../../util/LocalStorage";
import TwitchClient from "../../service/TwitchClientOld";
import { PageHeader } from "../PageHeader";
import { FlexCol, FlexRow } from "../util/FlexBox";
import HoagieClient from "../../service/HoagieClient";
import Config from "../../Config";
import { LoginContext } from "../context/LoginContextProvider";
import { StateContext } from "../context/StateContextProvider";

const chipColors: Record<string, any> = {
  enabled: "success",
  webhook_callback_verification_failed: "error",
};

export const HoagieDashboard = (props: {
  streamerName: string;
  scopes: string;
}) => {
  const { streamerName, scopes } = props;

  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [subscriptions, setSubscriptions] = useState<
    TwitchSubscription[] | undefined
  >(undefined);
  const [streamerId, setStreamerId] = useState<string | undefined>(undefined);

  async function createSubscriptions() {
    if (loginState.accessToken && loginState.username && appState.streamer) {
      const client = new HoagieOverlayClient();
      const response = await client.createSubscriptions(
        loginState.username,
        appState.streamer,
        loginState.accessToken
      );
      getSubscriptions();
    }
  }

  async function getSubscriptions() {
    if (loginState.username && loginState.accessToken) {
      const client = new HoagieOverlayClient();
      const subs = await client.listSubscriptions(
        loginState.username,
        loginState.accessToken
      );
      setSubscriptions(subs);
    }
  }

  useEffect(() => {
    const path = window.location.pathname;
    LocalStorage.set("lastPath", { path });
  }, []);

  useEffect(() => {
    getSubscriptions();
  }, [loginState.username, loginState.accessToken]);

  useEffect(() => {
    async function getStreamerId() {
      if (loginState.accessToken) {
        const client = new TwitchClient(loginState.accessToken);
        const id = await client.getUserId(props.streamerName);
        setStreamerId(id);
      }
    }
    getStreamerId();
  });

  const subscriptionsToDisplay = subscriptions?.filter(
    (sub) =>
      streamerId &&
      (sub.condition.to_broadcaster_user_id === `${streamerId}` ||
        sub.condition.from_broadcaster_user_id === `${streamerId}`)
  );

  let subConnectionStatus = "";
  if (subscriptionsToDisplay) {
    subConnectionStatus =
      subscriptionsToDisplay.length > 0 ? "CONNECTED" : "DISCONNECTED";
  }

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FlexCol className="subscriptions-container">
            <FlexRow alignItems="center">
              <h2 style={{ marginRight: 20 }}>Overlay Subscriptions</h2>
              {!subscriptionsToDisplay && <CircularProgress size={20} />}
              {subscriptionsToDisplay && subscriptionsToDisplay.length > 0 && (
                <LinkIcon style={{ color: "green", marginRight: 10 }} />
              )}
              {subscriptionsToDisplay && subscriptionsToDisplay.length <= 0 && (
                <LinkOffIcon style={{ color: "red", marginRight: 10 }} />
              )}
              <div
                style={{
                  color: subConnectionStatus === "CONNECTED" ? "green" : "red",
                }}
              >
                {subConnectionStatus}
              </div>
            </FlexRow>
            {loginState.accessToken &&
              subConnectionStatus === "DISCONNECTED" && (
                <FlexCol style={{ maxWidth: 120 }}>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => createSubscriptions()}
                  >
                    Connect
                  </Button>
                </FlexCol>
              )}
            {loginState.accessToken && subConnectionStatus === "CONNECTED" && (
              <FlexCol style={{ maxWidth: 120 }}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={async () => {
                    if (loginState.username && loginState.accessToken) {
                      const client = new HoagieOverlayClient();
                      await Promise.all(
                        subscriptionsToDisplay?.map((sub) =>
                          client.deleteSubscription(
                            sub.id,
                            loginState.username!,
                            loginState.accessToken!
                          )
                        ) ?? []
                      );
                      getSubscriptions();
                    }
                  }}
                >
                  Disconnect
                </Button>
              </FlexCol>
            )}
            {
              <FlexCol>
                {(subscriptionsToDisplay ?? []).map((sub) => (
                  <Card className="subscription-card">
                    <FlexRow className="subscription-data">
                      <div className="sub-type">{sub.type}</div>
                      <div className="sub-status">
                        <Chip
                          label={sub.status}
                          color={chipColors[sub.status] ?? "primary"}
                        />
                      </div>
                      <div className="sub-delete">
                        <Button
                          color="primary"
                          variant="contained"
                          className="sub-delete-button"
                          onClick={async () => {
                            if (loginState.username && loginState.accessToken) {
                              const client = new HoagieOverlayClient();
                              await client.deleteSubscription(
                                sub.id,
                                loginState.username,
                                loginState.accessToken
                              );
                              getSubscriptions();
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </FlexRow>
                  </Card>
                ))}
              </FlexCol>
            }
          </FlexCol>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
