import { SSLEventListItem, SongListEvent, SongListEventDescription, StreamerSongListHoagieClient } from '@hoagie/streamersonglist-service';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { StateContext } from '../components/context/StateContextProvider';

export const useStreamerSongListEventLog = () => {
  const client = new StreamerSongListHoagieClient()

  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [lastQueryTime, setLastQueryTime] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<SSLEventListItem[]>([]);

  const fetchEvents = async () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(new Date().getDate() - 1);
    if (loginState?.accessToken && appState?.streamer) {
      const now = new Date();
      setIsLoading(true);
      const response = await client.getEvents(undefined, appState.streamer, lastQueryTime ?? oneDayAgo);
      setLastQueryTime(now);
      setEvents([...events, ...response ?? []]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [appState.streamer, loginState?.accessToken, loginState?.username]);

  useEffect(() => {
    if (appState.songQueue) {
      setTimeout(() => fetchEvents(), 1500);
    }
  }, [appState.songQueue])

  return { events, fetchEvents, isLoading };
};
