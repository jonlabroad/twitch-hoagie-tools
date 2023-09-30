import { useCallback, useContext, useEffect, useState } from "react";
import { LoginContext } from "../components/context/LoginContextProvider";
import { StateContext } from "../components/context/StateContextProvider";
import HoagieClient from "../service/HoagieClient";

export interface SystemStatus {
  status: {
    chatEventSource: {
      isRunning: boolean;
      isEnabled: boolean;
      pendingCount: number;
      runningCount: number;
      status: string;
      statusMessage: string;
    };
  };
}

export function useSystemStatus() {
  const { state } = useContext(StateContext);
  const { state: loginState } = useContext(LoginContext);

  const [status, setStatus] = useState<any>(undefined);

  const refreshStatus = useCallback(async () => {
    if (!loginState.username || !loginState.accessToken || !state.streamer)
      return;

    const status = await new HoagieClient().getSystemStatus(
      loginState.username,
      loginState.accessToken,
      state.streamer
    );
    if (status) {
      setStatus(status);
    }
  }, [loginState.username, loginState.accessToken, state.streamer]);

  useEffect(() => {
    async function getStatus() {
      refreshStatus();
    }
    getStatus();
  }, [loginState.username, loginState.accessToken, state.streamer]);

  return [status, refreshStatus];
}
