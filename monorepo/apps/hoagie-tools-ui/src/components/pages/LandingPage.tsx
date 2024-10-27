import { Card, Container, Grid } from '@mui/material';
import { useContext, useEffect, useRef } from 'react';
import { HoagieUserDataContext } from '../context/HoagieUserDataContextProvider';
import { LoginContext } from '../context/LoginContextProvider';
import { StreamerCard } from '../streamer/StreamerCard';
import { TwitchUserInfoContext, TwitchUserInfoProvider } from '../context/TwitchUserInfoProvider';
import { useTwitchChannelSchedule } from '../../hooks/twitchChannelScheduleHooks';

export const LandingPage = () => {
  const { userData } = useContext(HoagieUserDataContext);
  const { state: loginState } = useContext(LoginContext);
  const { userData: twitchUserData, addUsers } = useContext(
    TwitchUserInfoContext
  );

  const streamerIds = useRef(userData?.streamerIds ?? []);
  useEffect(() => {
    if (addUsers && userData) {
      addUsers({
        userLogins: [],
        userIds: userData.streamerIds,
      });
      streamerIds.current = userData.streamerIds;
    }
  }, [addUsers, userData]);

  const [schedules, loading] = useTwitchChannelSchedule(
    streamerIds.current,
    5 * 60 * 1e3
  );
  console.log({ schedules, loading });

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

              const schedule = schedules[channelId];

              return (
                <StreamerCard
                  streamerId={channelId}
                  key={channelId}
                  userData={channelInfo}
                  schedule={schedule}
                />
              );
            })
          }
        </Grid>
      </Container>
    </TwitchUserInfoProvider>
  );
};
