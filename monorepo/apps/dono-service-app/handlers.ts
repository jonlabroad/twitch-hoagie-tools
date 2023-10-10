import { APIGatewayEvent } from "aws-lambda";
import { GetDonos } from "./src/GetDonos";

export const getdono = async (event: APIGatewayEvent) => {
  const { streamerName } = event.pathParameters ?? {};
  return await GetDonos.run(streamerName ?? "", event);
};
