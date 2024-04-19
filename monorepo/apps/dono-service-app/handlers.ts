import { APIGatewayEvent, EventBridgeEvent } from "aws-lambda";
import { GetDonos } from "./src/GetDonos";
import { WriteDonos } from "./src/WriteDonos";
import { twitchModStreamerLamdbaAuthorizer } from "@hoagie/api-util";

export async function authorizer(event: APIGatewayEvent, context: any, callback: (message: string | null, policy: any) => any) {
  await twitchModStreamerLamdbaAuthorizer(event, context, callback);
}

export const getdono = async (event: APIGatewayEvent) => {
  const { streamerId } = event.pathParameters ?? {};
  return await GetDonos.run(streamerId ?? "", event);
};

export const twitchchatevents = async (ev: EventBridgeEvent<any, any>) => {
  return await WriteDonos.run(ev);
};
