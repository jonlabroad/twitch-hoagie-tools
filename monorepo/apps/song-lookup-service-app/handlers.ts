import { APIGatewayEvent } from 'aws-lambda';
import { corsHeaders, createCacheHeader } from '@hoagie/api-util';

export async function songlookup(apiEvent: APIGatewayEvent) {
  const { query } = apiEvent.queryStringParameters ?? {};
  //const response = await songLookupService(query ?? "", apiEvent);
  //return response;
  return {
    statusCode: 501,
  }
}
