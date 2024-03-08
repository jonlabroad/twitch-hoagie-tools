import { BasicAuth, ModRequestAuthorizer, corsHeaders, createCacheHeader } from "@hoagie/api-util";
import { SecretsProvider } from "@hoagie/secrets-provider";
import { APIGatewayEvent } from "aws-lambda";
import { SongEvaluator } from "./SongEvaluator";

export async function songEvalService(query: string, event: APIGatewayEvent) {
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
  const result = await evaluator.evaluate(query);

  return {
    statusCode: 200,
    body: JSON.stringify(result ?? {}),
    headers: {
      ...corsHeaders,
      ...createCacheHeader(60),
    }
  }
}
