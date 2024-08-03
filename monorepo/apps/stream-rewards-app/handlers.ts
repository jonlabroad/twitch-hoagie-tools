import { APIGatewayEvent, EventBridgeEvent } from 'aws-lambda';
import { corsHeaders, createCacheHeader, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { TwitchChatNotificationEvent, TwitchChatNotificationEventHandler } from '@hoagie/stream-rewards';

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
  handler.handle(event.detail);

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "OK" }, null, 2),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(5),
    },
  };
}
