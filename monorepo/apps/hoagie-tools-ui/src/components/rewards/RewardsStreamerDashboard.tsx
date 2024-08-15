import { useContext, useEffect, useMemo, useState } from 'react';
import { StreamRewardsClient, TokenType } from '@hoagie/stream-rewards';
import { LoginContext } from '../context/LoginContextProvider';
import { useStreamerName } from '../../hooks/useStreamerName';
import { StateContext } from '../context/StateContextProvider';
import { UserRewardTokens } from './UserRewardTokens';
import { Container } from '@mui/material';
import { TwitchUserInfoContext } from '../context/TwitchUserInfoProvider';
import { ConnectButton } from '../connection/ConnectButton';
import { streamRewardsConnectionConfig } from '../connection/ConnectionConfig';

export const RewardsStreamerDashboard = () => {
  useStreamerName();
  const twitchUserData = useContext(TwitchUserInfoContext);

  const loginContext = useContext(LoginContext);
  const { state: appState } = useContext(StateContext);

  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [redemptions, setRedemptions] = useState<TokenType[]>([]);

  const tokensByOwnerId = useMemo(() => tokens.reduce((acc, token) => {
    if (!acc[token.ownerId]) {
      acc[token.ownerId] = [];
    }
    acc[token.ownerId].push(token);
    return acc;
  }, {} as Record<string, TokenType[]>)
  , [tokens]);

  useEffect(() => {
    if (twitchUserData.addUsers) {
      twitchUserData.addUsers({
        userLogins: [],
        userIds: Object.keys(tokensByOwnerId),
      });
    }
  }, [tokensByOwnerId, twitchUserData?.addUsers]);

  const getTokens = async (userId: string, accessToken: string) => {
    if (appState.streamerId) {
      const auth = {
        userId,
        accessToken,
      };
      const client = new StreamRewardsClient();

      const tokens = await client.getTokens({ streamId: appState.streamerId }, auth);
      setTokens(tokens);
    }
  };

  const getRedemptions = async (userId: string, accessToken: string) => {
    if (appState.streamerId) {
      const auth = {
        userId,
        accessToken,
      };
      const client = new StreamRewardsClient();

      const redemptions = await client.getRedemptions({ streamId: appState.streamerId }, auth);
      setRedemptions(redemptions);
    }
  }

  useEffect(() => {
    if (loginContext.state.userId && loginContext.state.accessToken) {
      getTokens(loginContext.state.userId!, loginContext.state.accessToken!);
      getRedemptions(loginContext.state.userId!, loginContext.state.accessToken!);
    }
  }, [loginContext.state.userId, loginContext.state.accessToken, appState.streamerId]);

  return (
    <Container maxWidth={"xl"}>
      <div>
        <h1>Stream Rewards</h1>
        <ConnectButton config={streamRewardsConnectionConfig} />
        <h2>Tokens</h2>
        {Object.keys(tokensByOwnerId).map(ownerId => {
          const tokens = tokensByOwnerId[ownerId];
          const username = tokens[0].ownerUsername.toLowerCase();
          return (
            <UserRewardTokens
              streamerId={appState.streamerId!}
              userId={ownerId}
              allStreamerTokens={tokens}
              twitchUserData={twitchUserData.userData[username]}
            />
          );
        })}
      </div>
    </Container>
  );
};
