import { APIGatewayEvent, EventBridgeEvent } from 'aws-lambda';
import { corsHeaders, createCacheHeader, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { TwitchChatNotificationEvent, TwitchChatNotificationEventHandler, TwitchCustomRewardRedemptionAddEvent, TwitchRewardRedemptionHandler } from '@hoagie/stream-rewards';

const version = "1.0.0";

/*
export async function authorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}
*/

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
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const handler = new TwitchRewardRedemptionHandler();
  const result = await handler.handle(event.detail.event);

  return {
    result,
  };
}
