import { TwitchAccessToken, TwitchSubscription } from '@hoagie/service-clients';
import { SubscriptionUtil } from '../util/SubscriptionUtil';
import { FlexCol, FlexRow } from '../../util/FlexBox';
import VerifiedIcon from '@mui/icons-material/Verified';
import { AuthTokenStatus } from './AuthTokenStatus';
import { TokenCategory } from '@hoagie/api-util';
import { AccessTokenInfo, ValidationResult } from '@hoagie/config-service';
import { Button, Card, Modal } from '@mui/material';
import {
  ConnectionConfig,
  createConnectUrl,
} from '../../connection/ConnectionConfig';
import { ConnectButton } from '../../connection/ConnectButton';
import { CopyButton } from '../../util/CopyButton';
import { TwitchAvatar } from '../../avatar/TwitchAvatar';
import { useState } from 'react';
import { botId } from './RewardEventSubSubscriptionsContainer';

const requiredSubscriptions = [
  {
    type: 'channel.chat.notification',
  },
  {
    type: 'channel.chat.message',
  },
  {
    type: 'channel.channel_points_custom_reward_redemption.add',
  },
];

const requiredAuthTokens = {
  broadcaster: {
    type: 'REWARDS',
    scopes: ['channel:bot', 'channel:read:redemptions'],
  },
  bot: {
    type: 'BOT',
    scopes: ['user:bot'],
  },
};

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
  const requiredBroadcasterTokens = requiredAuthTokens.broadcaster;
  const requiredBotTokens = requiredAuthTokens.bot;

  const sectionCardStyle = {
    maxWidth: 1024,
    marginBottom: 16,
    padding: 12,
  };

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
        {requiredSubscriptions.map((sub) => {
          const subscription = props.subscriptions.find((s) =>
            SubscriptionUtil.subscriptionMatches(
              {
                type: sub.type,
                broadcaster_user_id: props.broadcasterId,
              },
              s
            )
          );
          return (
            <>
              <FlexRow>
                <div style={{ marginRight: 10 }}>
                  {subscription ? <VerifiedIcon /> : <div>-</div>}
                </div>
                <div>{sub.type}</div>
              </FlexRow>
            </>
          );
        })}
      </Card>
    </div>
  );
};
