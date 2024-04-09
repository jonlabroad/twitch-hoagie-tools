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
    if (!loginState.userId || !loginState.accessToken || !state.streamerId)
      return;

    const status = await new HoagieClient().getSystemStatus(
      loginState.userId,
      loginState.accessToken,
      state.streamerId
    );
    if (status) {
      setStatus(status);
    }
  }, [loginState.userId, loginState.accessToken, state.streamerId]);

  useEffect(() => {
    async function getStatus() {
      refreshStatus();
    }
    getStatus();
  }, [loginState.userId, loginState.accessToken, state.streamerId]);

  return [status, refreshStatus];
}
