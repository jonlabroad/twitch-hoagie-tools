import { APIGatewayEvent } from 'aws-lambda';
import { songEvalService } from '@hoagie/song-eval-service';
import { Config } from './src/Config';

export async function songeval(apiEvent: APIGatewayEvent) {
  console.log({ apiEvent });
  const { query } = apiEvent.queryStringParameters ?? {};
  const response = await songEvalService(query ?? "", apiEvent, {
    tableName: Config.tableName,
    version: Config.version
  });
  return response;
}
