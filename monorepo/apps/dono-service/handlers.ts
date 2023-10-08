import { APIGatewayEvent } from "aws-lambda";
import { GetDonos } from "./src/GetDonos";

export const getdono = async (event: APIGatewayEvent) => {
  return await GetDonos.run(event);
};
