import { StreamerSongListHoagieClient } from '@hoagie/streamersonglist-service';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { StateContext } from '../components/context/StateContextProvider';

export const useStreamersongListEvents = () => {
  const client = new StreamerSongListHoagieClient()

  const { state: appState } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = useCallback(async () => {
    if (loginState && loginState.accessToken && appState.streamer && appState.streamerData?.streamData.started_at) {
      const response = await client.getEvents(undefined, appState.streamer, new Date(appState.streamerData.streamData.started_at), new Date());
    }
  }, [appState.streamer, loginState.username, loginState.accessToken]);

  useEffect(() => {

  })
};
