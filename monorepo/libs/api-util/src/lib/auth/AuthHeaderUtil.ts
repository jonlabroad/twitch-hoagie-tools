import { APIGatewayEvent } from "aws-lambda";

export function getAuthHeaderFromEvent(ev: APIGatewayEvent) {
  return ev.headers["Authorization"] ?? ev.headers["authorization"] ?? "";
}
