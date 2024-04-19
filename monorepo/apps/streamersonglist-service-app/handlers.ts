import { EventBridgeEvent, APIGatewayEvent } from 'aws-lambda';
import { GetQueueEvents, WriteQueueEvent } from '@hoagie/streamersonglist-service';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';

export async function authorizer(event: APIGatewayEvent, context: any, callback: any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export async function writeEvent(eventBridgeEvent: EventBridgeEvent<any, any>) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  await SecretsProvider.init();
  const handler = new WriteQueueEvent({
    tableName: process.env.TABLENAME,
    twitchClient: createTwitchClient(),
  });
  return await handler.writeEvent(eventBridgeEvent);
}

export async function getEvents(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  await SecretsProvider.init();
  const handler = new GetQueueEvents({
    tableName: process.env.TABLENAME,
    twitchClient: createTwitchClient(),
  });

  return await handler.getEvents({
    userId: apiEvent.pathParameters?.streamerId,
    startDate: new Date(apiEvent.queryStringParameters?.startDate ?? ""),
    endDate: new Date(apiEvent.queryStringParameters?.endDate ?? ""),
  });
}
