import { DBResponseCache, corsHeaders, createCacheHeader } from "@hoagie/api-util";
import { SecretsProvider } from "@hoagie/secrets-provider";
import { APIGatewayEvent } from "aws-lambda";
import { SongEvaluator } from "./SongEvaluator";

export interface SongEvalConfig {
  tableName: string
  version: string
}

export async function songEvalService(query: string, event: APIGatewayEvent, config: SongEvalConfig) {
  console.log({ query });

  if (!query) {
    return {
      statusCode: 400,
      body: 'Missing query',
      headers: corsHeaders,
    };
  }
/*
  const { username } = BasicAuth.decode(event.headers["authorization"] ?? event.headers["Authorization"] ?? "");
  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
  if (!streamerName) {
    return {
      statusCode: 400,
      body: 'Missing streamername',
      headers: corsHeaders,
    };
  }

  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    streamerName
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }
*/
  await SecretsProvider.init();
  const secrets = SecretsProvider.getInstance().secrets;
  const evaluator = new SongEvaluator(secrets["geniusClientSecret"], secrets["badWordsSecret"]);

  const cache = new DBResponseCache("songeval", config.tableName);
  const cachedValue = await cache.get(query, config.version);
  let result: any;
  if (cachedValue) {
    result = cachedValue;
    console.log("Using cached value");
  } else {
    console.log("Performing evaluation...");
    result = await evaluator.evaluate(query);
    if (result) {
      await cache.set(query, result, config.version);
    }
  }

  const returnValue = {
    statusCode: 200,
    body: JSON.stringify(result ?? {}),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(120),
    }
  };
  return returnValue;
}
