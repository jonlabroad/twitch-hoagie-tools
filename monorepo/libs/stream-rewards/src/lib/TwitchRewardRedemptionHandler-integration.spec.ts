import { TwitchChatNotificationEventHandler } from './TwitchChatNotificationEventHandler';
import { mockRewardRedemptionEvent } from './Mock/RewardRedemptionEvent';
import { TwitchRewardRedemptionHandler } from './TwitchRewardRedemptionHandler';
import {
  RewardToken,
  RewardTokenType,
  TokenSubType,
} from './Tokens/RewardToken';
import TokenDBClient from './Persistance/TokenDBClient';
import { ChatBot } from './Chat/ChatBot';
import { ChatClient } from './Chat/ChatClient';
import * as Secrets from '../Secrets';
import { ConfigDBClient } from '@hoagie/config-service';

const mockUserId = 'TwitchRewardRedemptionHandler_UserID';
const mockBroadcasterId = 'TwitchRewardRedemptionHandler_BroadcasterID';

const mockUserIdNoToken = 'TwitchRewardRedemptionHandler_UserID_NoToken';

describe('TwitchChatNotificationEventHandler integration tests', () => {
  // Note: Requires local DynamoDB running at http://localhost:8000
  // See test/dynamodb/run-local-dynamodb.ps1
  let handler: TwitchRewardRedemptionHandler;

  beforeEach(() => {
    const broadcasterId = '408982109';
    process.env['TABLENAME'] = 'HoagieTools-local';
    process.env['TOKENTABLENAME'] = 'HoagieRewardTokens-local';
    process.env['DYNAMODB_ENDPOINT'] = 'http://localhost:8000';

    const configDbClient = new ConfigDBClient("HoagieTools-prod");
    const chatClient = new ChatClient(Secrets.streamRewardsSecrets.BotUserId);

    handler = new TwitchRewardRedemptionHandler(
      new ChatBot(broadcasterId, chatClient, configDbClient)
    );
  });

  it('should handle live learn reward redemption event', async () => {
    const ev = {
      ...mockRewardRedemptionEvent,
      broadcaster_user_id: mockBroadcasterId,
      user_id: mockUserId,
      reward: {
        ...mockRewardRedemptionEvent.reward,
        title: 'Request: Live Learn',
      },
    };

    await grantToken(mockUserId, mockBroadcasterId, 'sub', 'sub', '3000');

    const result = await handler.handle(ev);

    await expect(result).toBe(true);
  }, 100000);
/*
  it('should fail to handle reward redemption without a valid token', async () => {
    const ev = {
      ...mockRewardRedemptionEvent,
      broadcaster_user_id: mockBroadcasterId,
      user_id: mockUserIdNoToken,
      reward: {
        ...mockRewardRedemptionEvent.reward,
        title: 'Request: Live Learn',
      },
    };

    const result = await handler.handle(ev);

    await expect(result).toBe(false);
  }, 100000);
*/
});

async function grantToken(
  userId: string,
  broadcasterId: string,
  tokenKey: string,
  tokenType: RewardTokenType = 'sub',
  tokenSubType: TokenSubType = '3000'
) {
  const token: RewardToken = {
    ownerId: userId,
    broadcasterId: broadcasterId,
    ownerUsername: userId,
    key: tokenKey,
    type: tokenType,
    subType: tokenSubType,
    value: 1,
    grantTimestamp: new Date(),
    expiryTimestamp: new Date(),
  };

  const client = new TokenDBClient();
  await client.upsertToken(token);
}
