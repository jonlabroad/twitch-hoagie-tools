import { APIGatewayEvent } from 'aws-lambda';
import { GetSystemStatus, periodicConfigUpdate as periodicConfigUpdateService, saveAccessToken, getAccessTokenInfo as getAccessTokenInfoImpl, TwitchEventSub, TwitchTokenValidationParams, TwitchTokenValidator } from '@hoagie/config-service';
import { createTwitchClient } from './src/createTwitchClient';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { AuthTokenDBClient, BasicAuth, ModsDbClientV2, corsHeaders, createCacheHeader, noCacheHeaders, twitchAuthenticateOnlyAuthorizer, twitchModStreamerLamdbaAuthorizer } from '@hoagie/api-util';
import { ConfigDBClient, TokenCategory } from 'libs/config-service/src/lib/client/ConfigDBClient';
import { CreateSubscriptionInput } from '@hoagie/service-clients';

const version = "1.0.0";

export async function authenticateOnlyAuthorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  return await twitchAuthenticateOnlyAuthorizer(event, context, callback);
}

export async function adminOnlyAuthorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  return await twitchModStreamerLamdbaAuthorizer(event, context, callback, true);
}

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

export async function setAccessTokenCallback (event: APIGatewayEvent) {
  try {
    console.log({ event });
    if (!process.env.TABLENAME) {
      throw new Error('TABLENAME environment variable is required');
    }

    const { category } = event.pathParameters ?? {};
    if (!category) {
      throw new Error("category not defined");
    }

    const result = await saveAccessToken(process.env.TABLENAME, event.queryStringParameters?.code ?? "", category as TokenCategory);
    if (!result) {
      return {
        statusCode: 500,
        body: "Error saving access token",
        headers: corsHeaders,
      };
    }

    return {
      statusCode: 200,
      body: "Successfully connected to HoagieTools!",
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: "Error connecting to HoagieTools :(",
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  }
}

export async function twitchAuthTokenValidation(event: APIGatewayEvent) {
  ///api/v1/access/twitchtoken/validate

  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  let validationParams: TwitchTokenValidationParams | undefined;
  try {
    validationParams = event.body ? JSON.parse(event.body) : undefined;
    console.log({ validationParams });
    if (!validationParams) {
      throw new Error("Invalid request body");
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: "Invalid request body",
      headers: corsHeaders,
    };
  }

  try {
    await SecretsProvider.init();
    const handler = new TwitchTokenValidator(createTwitchClient(), new AuthTokenDBClient(process.env.TABLENAME));
    const result = await handler.validate(validationParams);
    return {
      statusCode: 200,
      body: JSON.stringify(result, null, 2),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: err.message,
      headers: corsHeaders,
    };
  }
}

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

export async function getSubscriptions (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  await SecretsProvider.init()

  const handler = new TwitchEventSub();
  try {
    const subscriptions = await handler.getSubscriptions();
    if (!subscriptions) {
      throw new Error("No subscriptions found");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(subscriptions, null, 2),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(1),
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: err.message,
      headers: corsHeaders,
    };
  }
}

export async function createSubscriptions (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const handler = new TwitchEventSub();
  try {
    const subscriptionInput = event.body ? JSON.parse(event.body) as CreateSubscriptionInput[] : undefined;
    if (!subscriptionInput) {
      throw new Error("Invalid request body");
    }

    const subscriptionInfo = await handler.createSubscriptions(subscriptionInput);

    return {
      statusCode: 200,
      body: JSON.stringify(subscriptionInfo, null, 2),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: err.message,
      headers: corsHeaders,
    };
  }
}

export async function deleteSubscription (event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  const handler = new TwitchEventSub();
  try {
    const subscriptionId = event.pathParameters?.id;
    if (!subscriptionId) {
      throw new Error("Subscription ID path parameter required");
    }

    await handler.deleteSubscription(subscriptionId);

    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: err.message,
      headers: corsHeaders,
    };
  }
}

export async function getAccessTokenInfo ( event: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  await SecretsProvider.init()

  try {
    const data = await getAccessTokenInfoImpl(process.env.TABLENAME, event.pathParameters?.userId ?? "");
    if (!data) {
      throw new Error("No access token data found");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data, null, 2),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(1),
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: err.message,
      headers: corsHeaders,
    };
  }
}
