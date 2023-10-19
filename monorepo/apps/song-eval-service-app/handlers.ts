import { APIGatewayEvent } from 'aws-lambda';
import { songEvalService } from '@hoagie/song-eval-service';

export async function songeval(apiEvent: APIGatewayEvent) {
  const { query } = apiEvent.queryStringParameters ?? {};
  return await songEvalService(query ?? "", apiEvent);
}
