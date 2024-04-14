import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../components/context/LoginContextProvider';
import { StateContext } from '../components/context/StateContextProvider';
import HoagieClient from '../service/HoagieClient';
import { ConfigClient } from '@hoagie/config-service';
import Config from '../Config';

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

    const status = await new ConfigClient(
      loginState.userId,
      loginState.accessToken,
      Config.environment
    ).getSystemStatus();
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
