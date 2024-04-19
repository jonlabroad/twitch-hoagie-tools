import { APIGatewayEvent } from 'aws-lambda';
import { songLookupService } from '@hoagie/song-lookup-service';
import { twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';

const version = "1.0.0";

export async function authorizer(event: APIGatewayEvent, context: any, callback: any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export async function songlookup(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error('SPOTIFY_CLIENT_ID environment variable is required');
  }

  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('SPOTIFY_CLIENT_SECRET environment variable is required');
  }

  const response = await songLookupService({
    tableName: process.env.TABLENAME,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    version,
  }, apiEvent);
  return response;
}
