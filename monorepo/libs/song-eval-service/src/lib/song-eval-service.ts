import { DBResponseCache, corsHeaders, createCacheHeader, noCacheHeaders } from "@hoagie/api-util";
import { SecretsProvider } from "@hoagie/secrets-provider";
import { APIGatewayEvent } from "aws-lambda";
import { SongEvaluator } from "./SongEvaluator";
import { SongEvalDbClient } from "./client/SongEvalDBClient";

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

export async function getSongEvalConfig(tableName: string, channelId: string) {
  await SecretsProvider.init();

  const client = new SongEvalDbClient(tableName);
  const result = await client.read(channelId);
  if (!result) {
    return {
      statusCode: 404,
      body: `No config found for channel ${channelId}`,
      headers: corsHeaders,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...result,
      whitelist: Array.from(result.whitelist ?? []),
     } ?? {}),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(1),
    }
  };
}

export async function addWord(tableName: string, channelId: string, word: string) {
  await SecretsProvider.init();

  const client = new SongEvalDbClient(tableName);
  await client.addWhitelistWord(channelId, word);

  return {
    statusCode: 200,
    body: `OK`,
    headers: corsHeaders,
  };
}

export async function removeWord(tableName: string, channelId: string, word: string) {
  await SecretsProvider.init();

  const client = new SongEvalDbClient(tableName);
  await client.removeWhitelistWord(channelId, word);

  return {
    statusCode: 200,
    body: `OK`,
    headers: corsHeaders,
  };
}
