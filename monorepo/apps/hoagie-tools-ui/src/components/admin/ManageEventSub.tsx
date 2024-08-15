import {
  Grid,
  Button,
  Typography,
  Card,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/Link';
import { TwitchSubscription, UserData } from '@hoagie/service-clients';
import React from 'react';
import HoagieClient from '../../service/HoagieClient';
import { createTwitchClient } from '../../util/CreateTwitchClient';
import LocalStorage from '../../util/LocalStorage';
import { LoginContext } from '../context/LoginContextProvider';
import { StateContext } from '../context/StateContextProvider';
import { FlexCol, FlexRow } from '../util/FlexBox';

const chipColors: Record<string, any> = {
  enabled: 'success',
  webhook_callback_verification_failed: 'error',
};

export interface ManageEventSubProps {}

export const ManageEventSub = (props: ManageEventSubProps) => {
  const { state: appState } = useContext(StateContext);
  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;

  const [subscriptions, setSubscriptions] = useState<
    TwitchSubscription[] | undefined
  >(undefined);

  const [userInfo, setUserInfo] = useState<Record<string, UserData>>({});

  useEffect(() => {
    async function getUserInfo() {
      if (loginState.accessToken) {
        const idsToFetch = subscriptions
          ?.map((sub) =>
            [
              sub.condition.broadcaster_user_id,
              sub.condition.from_broadcaster_user_id,
              sub.condition.to_broadcaster_user_id,
            ].filter((v) => !!v)
          )
          .flat() as string[];
        const client = createTwitchClient(loginState.accessToken);
        const userDatas = await client.getUserDataById(idsToFetch);
        setUserInfo((prev) => ({
          ...prev,
          ...userDatas.reduce((acc, user) => ({ ...acc, [user.id]: user }), {}),
        }));
      }
    }

    getUserInfo();
  }, [subscriptions, loginState.userId, loginState.accessToken]);

  async function createSubscriptions() {
    if (loginState.accessToken && loginState.userId && appState.streamerId) {
      const client = new HoagieClient();
      const response = await client.createSubscriptions(
        loginState.userId,
        appState.streamerId,
        loginState.accessToken
      );
      getSubscriptions();
    }
  }

  async function createSelfSubscriptions() {
    if (loginState.accessToken && loginState.userId) {
      const client = new HoagieClient();
      const response = await client.createSelfSubscriptions(
        loginState.userId,
        loginState.userId,
        loginState.accessToken
      );
      getSubscriptions();
    }
  }

  async function getSubscriptions() {
    if (loginState.userId && loginState.accessToken) {
      const client = new HoagieClient();
      const subs = await client.listSubscriptions(
        loginState.userId,
        appState.streamerId ?? 'hoagieman5000',
        loginState.accessToken
      );
      setSubscriptions(subs);
    }
  }

  useEffect(() => {
    const path = window.location.pathname;
    LocalStorage.set('lastPath', { path });
  }, []);

  useEffect(() => {
    getSubscriptions();
  }, [loginState.username, loginState.accessToken]);

  const subscriptionsToDisplay = subscriptions;

  let subConnectionStatus = '';
  if (subscriptionsToDisplay) {
    subConnectionStatus =
      subscriptionsToDisplay.length > 0 ? 'CONNECTED' : 'DISCONNECTED';
  }

  const getSubscriptionUserIds = (sub: TwitchSubscription): string[] => {
    return [
      sub.condition.broadcaster_user_id,
      sub.condition.from_broadcaster_user_id,
      sub.condition.to_broadcaster_user_id,
    ].filter((v) => !!v) as string[];
  };

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FlexCol className="subscriptions-container">
            <FlexRow alignItems="center">
              <h2 style={{ marginRight: 20 }}>EventSub Subscriptions</h2>
              {!subscriptionsToDisplay && <CircularProgress size={20} />}
              {subscriptionsToDisplay && subscriptionsToDisplay.length > 0 && (
                <LinkIcon style={{ color: 'green', marginRight: 10 }} />
              )}
              {subscriptionsToDisplay && subscriptionsToDisplay.length <= 0 && (
                <LinkOffIcon style={{ color: 'red', marginRight: 10 }} />
              )}
              <div
                style={{
                  color: subConnectionStatus === 'CONNECTED' ? 'green' : 'red',
                }}
              >
                {subConnectionStatus}
              </div>
            </FlexRow>
            {loginState.accessToken &&
              subConnectionStatus === 'DISCONNECTED' && (
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
            {loginState.accessToken &&
              <FlexCol style={{ maxWidth: 220, marginBottom: 10 }}>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => createSelfSubscriptions()}
                  >
                    Connect As Streamer
                  </Button>
                </FlexCol>
            }
            {loginState.accessToken && subConnectionStatus === 'CONNECTED' && (
              <FlexCol style={{ maxWidth: 120 }}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={async () => {
                    if (loginState.userId && loginState.accessToken) {
                      const client = new HoagieClient();
                      await Promise.all(
                        subscriptionsToDisplay?.map((sub) =>
                          client.deleteSubscription(
                            sub.id,
                            loginState.userId,
                            loginState.accessToken
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
                      <FlexRow className="sub-broadcaster">
                        <FlexRow justifyContent="center" alignItems="center">
                          {getSubscriptionUserIds(sub).map((userId) => (
                            <>
                          <div className="menu-channel-avatar">
                            <img
                              src={
                                userInfo[userId]?.profile_image_url ?? ""
                              }
                            />
                          </div>
                          <Typography>
                            {userInfo[userId]?.display_name ?? ""}
                          </Typography>
                          </>
                        ))}
                        </FlexRow>
                      </FlexRow>
                      <div className="sub-type">{sub.type}</div>
                      <div className="sub-status">
                        <Chip
                          label={sub.status}
                          color={chipColors[sub.status] ?? 'primary'}
                        />
                      </div>
                      <div className="sub-delete">
                        <Button
                          color="primary"
                          variant="contained"
                          className="sub-delete-button"
                          onClick={async () => {
                            if (loginState.userId && loginState.accessToken) {
                              const client = new HoagieClient();
                              await client.deleteSubscription(
                                sub.id,
                                loginState.userId,
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
