import { TwitchAccessToken, TwitchSubscription } from '@hoagie/service-clients';
import { SubscriptionUtil } from '../util/SubscriptionUtil';
import { FlexCol, FlexRow } from '../../util/FlexBox';
import VerifiedIcon from '@mui/icons-material/Verified';
import { AuthTokenStatus } from './AuthTokenStatus';
import { TokenCategory } from '@hoagie/api-util';
import { AccessTokenInfo, ValidationResult } from '@hoagie/config-service';
import { Button, Card, Modal } from '@mui/material';
import {
  botAccountConnectionConfig,
  ConnectionConfig,
  createConnectUrl,
  streamRewardsConnectionConfig,
} from '../../connection/ConnectionConfig';
import { ConnectButton } from '../../connection/ConnectButton';
import { CopyButton } from '../../util/CopyButton';
import { TwitchAvatar } from '../../avatar/TwitchAvatar';
import { useState } from 'react';
import { botId } from './RewardEventSubSubscriptionsContainer';
import { EventSubConnectButton } from './EventSubConnectButton';
import { StreamRewardsStaticConfig } from '../StreamRewardsStaticConfig';

interface IProps {
  broadcasterId: string;
  broadcasterLogin: string;
  subscriptions: TwitchSubscription[];
  loggedInUserId: string | undefined;

  broadcasterTokenValidation: ValidationResult | undefined;
  botTokenValidation: ValidationResult | undefined;

  isLoading: boolean;

  refetchSubscriptions: () => void;
}

export const RewardEventSubSubscriptions = (props: IProps) => {
  const requiredBroadcasterTokens = streamRewardsConnectionConfig;
  const requiredBotTokens = botAccountConnectionConfig;

  const sectionCardStyle = {
    maxWidth: 1024,
    marginBottom: 16,
    padding: 12,
  };

  const requiredSubscriptions = (props.loggedInUserId && props.broadcasterId) ?
    StreamRewardsStaticConfig.EventSubSubscriptionDefinitions(props.loggedInUserId, props.broadcasterId) :
    undefined;

  return (
    <div>
      <h2>Auth Tokens</h2>
      <Card style={sectionCardStyle}>
        <h3>From Broadcaster</h3>
        <FlexCol marginBottom={4}>
          <FlexRow>
            <p>{`The broadcaster (${props.broadcasterLogin}) must authorize the app using this URL`}</p>
          </FlexRow>
          <CopyButton
            label={'Copy URL'}
            value={createConnectUrl({
              type: requiredBroadcasterTokens.type,
              scopes: requiredBroadcasterTokens.scopes,
            })}
          />
        </FlexCol>
        <AuthTokenStatus
          token={props.broadcasterTokenValidation}
          tokenType={requiredBroadcasterTokens.type as TokenCategory}
          requiredScopes={requiredBroadcasterTokens.scopes}
          isLoading={props.isLoading}
        />
      </Card>
      <Card style={sectionCardStyle}>
        <h3>From Bot</h3>
        <FlexCol marginBottom={4}>
          <p>Login as HoagieBot5000 to connect</p>
          <ConnectButton
            disabled={props.loggedInUserId !== botId}
            label={'Connect Bot'}
            config={{
              type: requiredBotTokens.type,
              scopes: requiredBotTokens.scopes,
            }}
          />
        </FlexCol>
        <AuthTokenStatus
          token={props.botTokenValidation}
          tokenType={requiredBotTokens.type as TokenCategory}
          requiredScopes={requiredBotTokens.scopes}
          isLoading={props.isLoading}
        />
      </Card>
      <Card style={sectionCardStyle}>
        <h2>Event Sub Subscriptions</h2>
        <EventSubConnectButton
          disabled={!requiredSubscriptions}
          subscriptions={requiredSubscriptions ?? []}
        />
        {requiredSubscriptions?.map((reqSub) => {
          const subscription = props.subscriptions.find((sub) =>
            SubscriptionUtil.subscriptionMatches(
              {
                type: reqSub.type,
                user_id: reqSub.condition.user_id,
                broadcaster_user_id: props.broadcasterId,
              },
              sub
            )
          );
          return (
            <>
              <FlexRow>
                <div style={{ marginRight: 10 }}>
                  {subscription ? <VerifiedIcon /> : <div>-</div>}
                </div>
                <div>{reqSub.type}</div>
              </FlexRow>
            </>
          );
        })}
      </Card>
    </div>
  );
};
