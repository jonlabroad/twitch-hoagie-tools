import { EventBridgeEvent } from 'aws-lambda';
import { corsHeaders, createCacheHeader } from '@hoagie/api-util';
import { AccessTokenProvider, ChatClient, TwitchChatMessageHandler, TwitchChatNotificationEvent, TwitchChatNotificationEventHandler, TwitchCustomRewardRedemptionAddEvent, TwitchRewardRedemptionHandler } from '@hoagie/stream-rewards';
import { ChatBot } from '@hoagie/stream-rewards';
import { ConfigDBClient } from '@hoagie/config-service';
import TokenDbClient from 'libs/stream-rewards/src/lib/Persistance/TokenDBClient';
import { TwitchChatMessageWebhookEvent } from 'libs/stream-rewards/src/lib/Events/ChannelChatMessageEvent';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';

const version = "1.0.0";

const botUserId = "631768238"; // TODO

export async function rewardRedeemHandler(event: EventBridgeEvent<string, any>) {
  console.log(`Reward Redeem Handler: ${JSON.stringify(event, null, 2)}`);
  return;
}

export async function systemStatus (event: EventBridgeEvent<string, any>) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "OK" }, null, 2),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(5),
    },
  };
}

export async function twitchChatNotificationEventHandler (event: EventBridgeEvent<string, TwitchChatNotificationEvent>) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const handler = new TwitchChatNotificationEventHandler();
  const result = await handler.handle(event.detail.event);

  return {
    result,
  };
}

export async function twitchRewardRedemptionEventHandler (event: EventBridgeEvent<string, TwitchCustomRewardRedemptionAddEvent>) {
  await SecretsProvider.init();
  const tableName = process.env.TABLENAME;
  if (!tableName) {
    throw new Error('TABLENAME environment variable is required');
  }

  const broadcasterId = event.detail.event.broadcaster_user_id;

  const twitchClient = createTwitchClient();
  const chatClient = new ChatClient(botUserId, twitchClient);
  const configClient = new ConfigDBClient(tableName);
  const accessTokenProvider = new AccessTokenProvider(configClient, twitchClient);
  const chatBot = new ChatBot(botUserId, broadcasterId, chatClient, accessTokenProvider);

  const handler = new TwitchRewardRedemptionHandler(chatBot);
  const result = await handler.handle(event.detail.event);

  return {
    result,
  };
}

export async function twitchChatMessageEventHandler (event: EventBridgeEvent<string, TwitchChatMessageWebhookEvent>) {
  await SecretsProvider.init();
  const tableName = process.env.TABLENAME;
  if (!tableName) {
    throw new Error('TABLENAME environment variable is required');
  }

  const broadcasterId = event.detail.event.broadcaster_user_id;

  const twitchClient = createTwitchClient();
  const chatClient = new ChatClient(botUserId, twitchClient);
  const configClient = new ConfigDBClient(tableName);
  const accessTokenProvider = new AccessTokenProvider(configClient, twitchClient);
  const chatBot = new ChatBot(botUserId, broadcasterId, chatClient, accessTokenProvider);
  const tokenDbClient = new TokenDbClient();

  const handler = new TwitchChatMessageHandler(chatBot, tokenDbClient);
  const result = await handler.handle(event.detail);

  return {
    result,
  };}
