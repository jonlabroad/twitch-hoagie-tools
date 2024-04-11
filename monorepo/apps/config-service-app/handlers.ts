import { APIGatewayEvent } from 'aws-lambda';

const version = "1.0.0";

export async function periodicConfigUpdate(apiEvent: APIGatewayEvent) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log("<( HAI! )")

  return "K";
}
