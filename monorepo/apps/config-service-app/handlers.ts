import { APIGatewayEvent } from 'aws-lambda';
import { periodicConfigUpdate as periodicConfigUpdateService } from '@hoagie/config-service';
import { TwitchClient } from '@hoagie/service-clients';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { BasicAuth, ModRequestAuthorizer, ModsDbClientV2, corsHeaders, createCacheHeader } from '@hoagie/api-util';

const version = "1.0.0";

export async function periodicConfigUpdate(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  await SecretsProvider.init();
  const twitchClient = createTwitchClient();
  const response = periodicConfigUpdateService({
    tableName: process.env.TABLENAME,
    twitchClient,
});

  return response;
}

export async function getmods(event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const { streamerId } = event.pathParameters ?? {};
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }

  const client = new ModsDbClientV2(process.env.TABLENAME, {
      broadcasterId: streamerId
  });
  const mods = await client.readMods();
  return {
    statusCode: 200,
    body: JSON.stringify(mods ?? [], null, 2),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(1),
    },
  };
};

export async function addmod (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log({ headers: event.headers });
  const { username: userId } = BasicAuth.decode(event.headers.authorization ?? "");
  if (!userId) {
    throw new Error("Invalid authorization header");
  }

  const { streamerId, modId } = event.pathParameters ?? {};
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }
  if (!modId) {
    throw new Error("modId not defined");
  }

  const auth = await ModRequestAuthorizer.auth(userId, streamerId);
  if (auth) {
    return auth;
  }

  const client = new ModsDbClientV2(process.env.TABLENAME, {
    broadcasterId: streamerId
});
  await client.addMod(modId);
  return {
    statusCode: 200,
    body: "OK",
    headers: {
      ...corsHeaders,
    },
  };
};

export async function removemod (event: APIGatewayEvent) {
  console.log({ headers: event.headers });
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const { username: userId } = BasicAuth.decode(event.headers.authorization ?? "");
  if (!userId) {
    throw new Error("Invalid authorization header");
  }

  const { streamerId, modId } = event.pathParameters ?? {};
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }
  if (!modId) {
    throw new Error("modId not defined");
  }

  const auth = await ModRequestAuthorizer.auth(userId, streamerId);
  if (auth) {
    return auth;
  }

  const client = new ModsDbClientV2(process.env.TABLENAME, {
    broadcasterId: streamerId
  });
  const mods = await client.readMods();
  if (mods) {
    const index = mods?.mods.findIndex(
      (m) => m.toLowerCase() === modId.toLowerCase()
    );
    console.log({modId, index})
    if (index >= 0) {
      await client.deleteMod(modId, index);
    }
  }

  return {
    statusCode: 200,
    body: "OK",
    headers: {
      ...corsHeaders,
    },
  };
};
