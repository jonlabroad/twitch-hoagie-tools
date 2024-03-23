import { EventBridgeEvent, APIGatewayEvent } from 'aws-lambda';
import { GetQueueEvents, WriteQueueEvent } from '@hoagie/streamersonglist-service';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';

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
    userId: apiEvent.queryStringParameters?.userId,
    userLogin: apiEvent.queryStringParameters?.userLogin,
    startDate: new Date(apiEvent.queryStringParameters?.startDate ?? ""),
    endDate: new Date(apiEvent.queryStringParameters?.endDate ?? ""),
  });
}
