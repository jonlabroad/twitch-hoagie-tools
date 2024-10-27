import { ChannelSchedule } from "@hoagie/service-clients";
import { useCallback, useContext, useEffect, useState } from "react";
import { createTwitchClient } from "../util/CreateTwitchClient";
import { LoginContext } from "../components/context/LoginContextProvider";

export const useTwitchChannelSchedule = (broadcasterIds: string[], updateInterval: number | undefined): [Record<string, ChannelSchedule>, boolean] => {
  const {state: loginState} = useContext(LoginContext);

  const [schedules, setSchedules] = useState<Record<string, ChannelSchedule>>({});
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    if (loginState?.accessToken) {
      const client = createTwitchClient(loginState.accessToken);
      setLoading(true);

      const schedules = await Promise.all(broadcasterIds.map(broadcasterId => client.getSchedule(broadcasterId)));
      const reducedSchedules = schedules
      .filter(s => !!s?.data)
      .reduce((acc, schedule) => {
        if (schedule?.data) {
          acc[schedule.data.broadcaster_id] = schedule.data;
        }
        return acc;
      }, {} as Record<string, ChannelSchedule>);

      setSchedules(reducedSchedules);
      setLoading(false);
    }
  }, [broadcasterIds, loginState?.accessToken]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (updateInterval) {
      const interval = setInterval(() => {
        fetchSchedules();
      }, updateInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSchedules, updateInterval]);

  return [ schedules, loading ];
}
