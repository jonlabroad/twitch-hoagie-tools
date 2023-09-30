import { createContext, useEffect, useRef, useState } from "react";
import {
  LoginContextType,
  LoginState,
  defaultLoginState,
} from "../../state/LoginState";
import { SystemStatus, useSystemStatus } from "../../hooks/systemStatusHooks";

export interface SystemStatusContextProviderProps {
  children: any;
}

export interface SystemStatusContextType {
  status: SystemStatus | undefined;
  refresh: () => void;
}

export const SystemStatusContext = createContext<SystemStatusContextType>({
  status: undefined,
  refresh: () => {},
});

export const SystemStatusContextProvider = (
  props: SystemStatusContextProviderProps
) => {
  const [status, refresh] = useSystemStatus();
  const refreshStatus = useRef(refresh);

  const intervalHandle = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!intervalHandle.current) {
      intervalHandle.current = setInterval(() => {
        refreshStatus.current();
      }, 5 * 60 * 1e3);
    }
  }, []);

  useEffect(() => {
    refreshStatus.current = refresh;
  }, [refresh])

  return (
    <SystemStatusContext.Provider
      value={{
        status,
        refresh,
      }}
    >
      {props.children}
    </SystemStatusContext.Provider>
  );
};
