import { SSLEventListItem, StreamerSongListHoagieClient } from '@hoagie/streamersonglist-service';
import { useContext, useEffect, useState } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { StateContext } from '../components/context/StateContextProvider';
import Config from '../Config';

export const useStreamerSongListEventLog = () => {
  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [lastQueryTime, setLastQueryTime] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<SSLEventListItem[]>([]);

  const fetchEvents = async () => {
    const recentDate = new Date();
    recentDate.setHours(new Date().getHours() - 4);
    if (loginState?.userId && loginState?.accessToken && appState?.streamerId) {
      const client = new StreamerSongListHoagieClient(Config.environment, loginState.userId, loginState.accessToken)
      const now = new Date();
      setIsLoading(true);
      const response = await client.getEvents(appState.streamerId, lastQueryTime ?? recentDate);
      setLastQueryTime(now);
      const allEvents = [...events, ...response ?? []];
      const dedupedEvents = allEvents.reduce((acc, event) => {
        acc[event.id] = event;
        return acc;
      }, {} as Record<string, SSLEventListItem>);
      setEvents(Object.values(dedupedEvents));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [appState.streamerId, loginState?.userId, loginState?.accessToken]);

  useEffect(() => {
    if (appState.songQueue) {
      setTimeout(() => fetchEvents(), 1500);
    }
  }, [appState.songQueue])

  return { events, fetchEvents, isLoading };
};
