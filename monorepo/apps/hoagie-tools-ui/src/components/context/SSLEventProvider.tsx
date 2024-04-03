import { createContext } from "react";
import { useStreamerSongListEventLog } from "../../hooks/streamerSongListEventLogHooks";
import { SSLEventListItem } from "@hoagie/streamersonglist-service";

export interface SSLEventProviderProps {
  children: any;
}

export interface SSLEventContextType {
  fetchEvents: (() => void) | undefined;
  isLoading: boolean;
  events: SSLEventListItem[];
}

export const SSLEventContext = createContext<SSLEventContextType>({
  fetchEvents: undefined,
  isLoading: false,
  events: [],
});

export const SSLEventProvider = (props: SSLEventProviderProps) => {
  const { events: sslEvents, fetchEvents, isLoading } = useStreamerSongListEventLog();

  return (
    <SSLEventContext.Provider
      value={{
        isLoading,
        fetchEvents,
        events: sslEvents,
      }}
    >
      {props.children}
    </SSLEventContext.Provider>
  );
};
