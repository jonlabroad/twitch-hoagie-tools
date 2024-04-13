import { Card, Container, Grid } from '@mui/material';
import { useContext, useEffect } from 'react';
import { HoagieUserDataContext } from '../context/HoagieUserDataContextProvider';
import { LoginContext } from '../context/LoginContextProvider';
import { StreamerCard } from '../streamer/StreamerCard';
import { TwitchUserInfoContext, TwitchUserInfoProvider } from '../context/TwitchUserInfoProvider';

export const LandingPage = () => {
  const { userData } = useContext(HoagieUserDataContext);
  const { state: loginState } = useContext(LoginContext);
  const { userData: twitchUserData, addUsers } = useContext(
    TwitchUserInfoContext
  );
  useEffect(() => {
    if (addUsers && userData) {
      addUsers({
        userLogins: [],
        userIds: userData.streamerIds,
      });
    }
  }, [addUsers, userData]);

  if (!loginState.userId || !loginState.accessToken) {
    return <div></div>;
  }

  const twitchUserDataValues = Object.values(twitchUserData);
  const channelIdsToDisplay = (userData?.streamerIds || []).filter(
    (channelId) => !!twitchUserDataValues.find(u => u.id === channelId)
  );

  console.log({ twitchUserData });

  return (
    <TwitchUserInfoProvider>
      <Container maxWidth="md">
        <Grid item xs={8} marginTop={5}>
          {channelIdsToDisplay.map((channelId) => {
            const channelInfo = twitchUserDataValues.find(u => u.id === channelId);
              if (!channelInfo) {
                return null;
              }
              return (
                <StreamerCard
                  streamerId={channelId}
                  key={channelId}
                  userData={channelInfo}
                />
              );
            })
          }
        </Grid>
      </Container>
    </TwitchUserInfoProvider>
  );
};
