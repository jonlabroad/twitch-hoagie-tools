import { APIGatewayEvent, AppSyncResolverEvent, EventBridgeEvent } from "aws-lambda";
import { GetDonos } from "./src/GetDonos";
import { WriteDonos } from "./src/WriteDonos";
import { twitchModStreamerLamdbaAuthorizer } from "@hoagie/api-util";
import { GetDonosV2 } from "./src/GetDonosV2";

export async function authorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export const getdono = async (event: APIGatewayEvent) => {
  const { streamerId } = event.pathParameters ?? {};
  const { streamId } = event.queryStringParameters ?? {};
  return await GetDonos.run(streamerId ?? "", streamId ?? "");
};

export const getdonos = async (appSyncEvent: AppSyncResolverEvent<any, any>) => {
  console.log(appSyncEvent);
  const { streamerId, streamId } = appSyncEvent.arguments ?? {};
  return await GetDonosV2.run(streamerId, streamId);
};

export const twitchchatevents = async (ev: EventBridgeEvent<any, any>) => {
  return await WriteDonos.run(ev);
};
