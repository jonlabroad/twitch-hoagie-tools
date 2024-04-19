import { APIGatewayEvent } from 'aws-lambda';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { corsHeaders, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { getStreamHistory as getStreamHistoryFunction } from '@hoagie/streamer-service';
import { createTwitchClient } from './src/createTwitchClient';

const version = '1.0.0';

export async function authorizer(event: APIGatewayEvent, context: any, callback: any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export async function getStreamHistory(apiEvent: APIGatewayEvent) {
  try {
    if (!process.env.TABLENAME) {
      throw new Error('TABLENAME environment variable is required');
    }

    const { streamerId } = apiEvent.pathParameters ?? {};
    if (!streamerId) {
      throw new Error('streamerId not defined');
    }

    await SecretsProvider.init();

    return await getStreamHistoryFunction({
      apiEvent,
      tableName: process.env.TABLENAME,
      twitchClient: createTwitchClient(),
    });
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
