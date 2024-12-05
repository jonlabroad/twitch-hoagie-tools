import { SecretsProvider } from '@hoagie/secrets-provider';
import { TwitchPlusClient } from './TwitchPlusClient';
import { TwitchPlusStatusDBClient } from './TwitchPlusStatusDBClient';
import { StreamerConfigDBClient } from '@hoagie/streamer-service';
import { APIGatewayEvent } from 'aws-lambda';
import { corsHeaders, createCacheHeader, noCacheHeaders } from '@hoagie/api-util';

export const queryTwitchPlusStatus = async (apiEvent: APIGatewayEvent) => {
  await SecretsProvider.init();

  const tableName = process.env['TABLENAME'];
  if (!tableName) {
    throw new Error('No table name provided');
  }

  const streamerId = apiEvent.pathParameters?.['streamerId'];
  if (!streamerId) {
    throw new Error('streamerId not defined');
  }

  const client = new TwitchPlusStatusDBClient(streamerId, tableName);
  const dataPts = await client.query(streamerId);

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      ...createCacheHeader(60),
    },
    body: JSON.stringify(dataPts),
  }
};
