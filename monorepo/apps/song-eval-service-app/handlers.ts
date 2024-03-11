import { APIGatewayEvent } from 'aws-lambda';
import { songEvalService } from '@hoagie/song-eval-service';
import { corsHeaders, createCacheHeader } from '@hoagie/api-util';

export async function songeval(apiEvent: APIGatewayEvent) {
  console.log({ apiEvent });
  const { query } = apiEvent.queryStringParameters ?? {};
  const response = await songEvalService(query ?? "", apiEvent);
  return response;
}
