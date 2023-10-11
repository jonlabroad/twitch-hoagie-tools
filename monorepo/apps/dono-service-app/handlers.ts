import { APIGatewayEvent, EventBridgeEvent } from "aws-lambda";
import { GetDonos } from "./src/GetDonos";
import { WriteDonos } from "./src/WriteDonos";

export const getdono = async (event: APIGatewayEvent) => {
  const { streamerName } = event.pathParameters ?? {};
  return await GetDonos.run(streamerName ?? "", event);
};

export const twitchchatevents = async (ev: EventBridgeEvent<any, any>) => {
  return await WriteDonos.run(ev);
};
