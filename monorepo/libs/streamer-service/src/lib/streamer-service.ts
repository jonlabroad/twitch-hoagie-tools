import { corsHeaders, createCacheHeader } from "@hoagie/api-util";
import { TwitchClient } from "@hoagie/service-clients";
import { SecretsProvider } from "@hoagie/secrets-provider";
import { APIGatewayEvent } from "aws-lambda";
import { StreamsDbClient } from "./client/StreamHistoryDbClient";

export interface GetStreamHistoryParams {
  tableName: string;
  twitchClient: TwitchClient;
  apiEvent: APIGatewayEvent;
}

export async function getStreamHistory(props: GetStreamHistoryParams) {
  await SecretsProvider.init();

  const streamerId = props.apiEvent.pathParameters?.["streamerId"];
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }

  const client = new StreamsDbClient(streamerId, props.tableName);
  const history = await client.getStreamHistory(20);

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      ...createCacheHeader(10),
    },
    body: JSON.stringify(history ?? [], null, 2),
  };
}
