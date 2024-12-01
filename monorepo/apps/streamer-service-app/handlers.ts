import { APIGatewayEvent } from 'aws-lambda';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { corsHeaders, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { getStreamHistory as getStreamHistoryFunction, pollTwitchPlusStatus, StreamerConfigDBClient } from '@hoagie/streamer-service';
import { createTwitchClient } from './src/createTwitchClient';

const version = '1.0.0';

export async function authorizer(event: APIGatewayEvent, context: any, callback: any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export async function getConfig(apiEvent: APIGatewayEvent) {
  try {
    validateCommon(apiEvent);

    await SecretsProvider.init();

    const tableName = process.env.TABLENAME!;
    const { streamerId } = apiEvent.pathParameters ?? {};

    if (!streamerId) {
      throw new Error('streamerId not defined');
    }

    const dbClient = new StreamerConfigDBClient(tableName, streamerId);
    const config = await dbClient.getOrDefault({
      broadcasterId: streamerId
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(config),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

export async function setConfig(apiEvent: APIGatewayEvent) {
  try {
    validateCommon(apiEvent);

    await SecretsProvider.init();

    const tableName = process.env.TABLENAME!;
    const { streamerId } = apiEvent.pathParameters ?? {};

    if (!streamerId) {
      throw new Error('streamerId not defined');
    }

    if (!apiEvent.body) {
      throw new Error('config not defined');
    }

    let config = undefined;
    try {
      config = JSON.parse(apiEvent.body ?? '{}');
    } catch (error) {
      throw new Error('config is not valid JSON');
    }

    const dbClient = new StreamerConfigDBClient(tableName, streamerId);
    await dbClient.set({
      broadcasterId: streamerId,
    }, config);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({}),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

export async function getStreamHistory(apiEvent: APIGatewayEvent) {
  try {
    validateCommon(apiEvent);

    const { streamerId } = apiEvent.pathParameters ?? {};
    if (!streamerId) {
      throw new Error('streamerId not defined');
    }

    await SecretsProvider.init();

    return await getStreamHistoryFunction({
      apiEvent,
      tableName: process.env.TABLENAME!,
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

export async function pollTwitchPlusStatuses() {
  return await pollTwitchPlusStatus();
}

function validateCommon(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }
}
