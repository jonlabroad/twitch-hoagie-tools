import { GetBroadcasterRedemptionsResponse, IStreamRewardConfig, StreamRewardsClient } from '@hoagie/stream-rewards';
import { useContext, useEffect, useState } from 'react';
import { LoginContext } from '../../context/LoginContextProvider';
import { StateContext } from '../../context/StateContextProvider';
import { RewardSetup } from './RewardSetup';

interface IProps {}

export const RewardSetupContainer = (props: IProps) => {
  const { state: appState } = useContext(StateContext);
  const loginContext = useContext(LoginContext);
  const { state: loginState } = loginContext;

  const [redemptionOptions, setRedemptionOptions] = useState<GetBroadcasterRedemptionsResponse>([]);
  const [config, setConfig] = useState<IStreamRewardConfig | undefined>(undefined);

  const fetchAvailableRedemptions = async (
    userId: string,
    broadcasterId: string,
    accessToken: string
  ) => {
    const client = new StreamRewardsClient();
    const response = await client.getBroadcasterRedemptions(
      { streamId: broadcasterId },
      { userId, accessToken }
    );
    setRedemptionOptions(response);
  };

  useEffect(() => {
    if (appState.streamerId && loginState.userId && loginState.accessToken) {
      fetchAvailableRedemptions(
        loginState.userId,
        appState.streamerId,
        loginState.accessToken
      );
    }
  }, [appState.streamerId, loginState.userId, loginState.accessToken]);

  const fetchRewardsConfig = async (
    userId: string,
    broadcasterId: string,
    accessToken: string
  ) => {
    const client = new StreamRewardsClient();
    const response = await client.getRewardsConfig(
      { streamId: broadcasterId },
      { userId, accessToken }
    );
    setConfig(response);
  };

  const saveRewardsConfig = async(config: IStreamRewardConfig) => {
    if (appState.streamerId && loginState.userId && loginState.accessToken) {
      const client = new StreamRewardsClient();
      await client.saveRewardsConfig(
        config,
        { streamId: config.broadcasterId },
        { userId: loginState.userId, accessToken: loginState.accessToken },
      );
      await fetchRewardsConfig(loginState.userId, config.broadcasterId, loginState.accessToken);
    }
  }

  useEffect(() => {
    if (appState.streamerId && loginState.userId && loginState.accessToken) {
      fetchRewardsConfig(
        loginState.userId,
        appState.streamerId,
        loginState.accessToken
      );
    }
  }, [appState.streamerId, loginState.userId, loginState.accessToken]);

  return (
    <RewardSetup
      broadcasterId={appState.streamerId}
      savedConfig={config}
      redemptionOptions={redemptionOptions}

      onSaveConfig={(config: IStreamRewardConfig) => saveRewardsConfig(config)}
    />
  );
};
