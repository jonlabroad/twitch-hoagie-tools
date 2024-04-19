import { APIGatewayEvent } from 'aws-lambda';
import { GetSystemStatus, periodicConfigUpdate as periodicConfigUpdateService } from '@hoagie/config-service';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { BasicAuth, ModsDbClientV2, corsHeaders, createCacheHeader, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { ConfigDBClient } from 'libs/config-service/src/lib/client/ConfigDBClient';

const version = "1.0.0";

export async function authorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

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

export async function getUserData (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const { username: userId } = BasicAuth.decode(event.headers.authorization ?? "");
  const client = new ConfigDBClient(process.env.TABLENAME);
  const userData = await client.getUserData(userId);
  if (!userData) {
    return {
      statusCode: 404,
      body: "User not found",
      headers: corsHeaders,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(userData, null, 2),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(60),
    },
  };
};

export async function systemStatus (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const status = await GetSystemStatus.get("NONE");
  if (!status) {
    return {
      statusCode: 500,
      body: "Could not get system status",
      headers: corsHeaders,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status }, null, 2),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(5),
    },
  };
}
