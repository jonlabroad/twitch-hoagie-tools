import { APIGatewayEvent } from 'aws-lambda';
import { addWord, getSongEvalConfig, removeWord, songEvalService } from '@hoagie/song-eval-service';
import { Config } from './src/Config';
import {
  BasicAuth,
  ModRequestAuthorizer,
  corsHeaders,
  getAuthHeaderFromEvent,
  twitchModStreamerLamdbaAuthorizer,
} from '@hoagie/api-util';

export async function authorizer(event: APIGatewayEvent, context: any, callback: any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export async function songeval(apiEvent: APIGatewayEvent) {
  console.log({ apiEvent });
  const { query } = apiEvent.queryStringParameters ?? {};
  const response = await songEvalService(query ?? '', apiEvent, {
    tableName: Config.tableName,
    version: Config.version,
  });
  return response;
}

export async function getConfig(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log({ apiEvent });
  const { username: userId } = BasicAuth.decode(
    getAuthHeaderFromEvent(apiEvent)
  );
  const streamerId = apiEvent.pathParameters?.streamerId;
  if (!streamerId) {
    return {
      statusCode: 400,
      body: 'Missing streamerId',
      headers: corsHeaders,
    };
  }

  const authenticationResponse = await ModRequestAuthorizer.auth(
    userId,
    streamerId
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  try {
    return await getSongEvalConfig(process.env.TABLENAME, streamerId);
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }
}

export async function addAllowListWord(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log({ apiEvent });
  const { username: userId } = BasicAuth.decode(
    getAuthHeaderFromEvent(apiEvent)
  );
  const streamerId = apiEvent.pathParameters?.streamerId;
  if (!streamerId) {
    return {
      statusCode: 400,
      body: 'Missing streamerId',
      headers: corsHeaders,
    };
  }

  const authenticationResponse = await ModRequestAuthorizer.auth(
    userId,
    streamerId
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  const word = apiEvent.queryStringParameters?.word;
  if (!word) {
    return {
      statusCode: 400,
      body: 'Missing word',
      headers: corsHeaders,
    };
  }

  try {
    return await addWord(process.env.TABLENAME, streamerId, word);
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }
}

export async function removeAllowListWord(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log({ apiEvent });
  const { username: userId } = BasicAuth.decode(
    getAuthHeaderFromEvent(apiEvent)
  );
  const streamerId = apiEvent.pathParameters?.streamerId;
  if (!streamerId) {
    return {
      statusCode: 400,
      body: 'Missing streamerId',
      headers: corsHeaders,
    };
  }

  const authenticationResponse = await ModRequestAuthorizer.auth(
    userId,
    streamerId
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  const word = apiEvent.queryStringParameters?.word;
  if (!word) {
    return {
      statusCode: 400,
      body: 'Missing word',
      headers: corsHeaders,
    };
  }

  try {
    return await removeWord(process.env.TABLENAME, streamerId, word);
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }
}
