import { SongListEventDescription, StreamerSongListHoagieClient } from '@hoagie/streamersonglist-service';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { StateContext } from '../components/context/StateContextProvider';

export const useStreamerSongListEventLog = () => {
  const client = new StreamerSongListHoagieClient()

  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [events, setEvents] = useState<SongListEventDescription[]>([]);

  const fetchEvents = useCallback(async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(new Date().getDate() - 2);
    if (loginState?.accessToken && appState?.streamer) {
      const response = await client.getEventDescriptions(undefined, appState.streamer, twoDaysAgo, new Date());
      setEvents(response);
    }
  }, [appState.streamer, loginState.username, loginState.accessToken]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, fetchEvents };
};
