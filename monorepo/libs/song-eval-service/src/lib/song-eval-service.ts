import { BasicAuth, ModRequestAuthorizer } from "@hoagie/api-util";
import { APIGatewayEvent } from "aws-lambda";

export async function songEvalService(query: string, event: APIGatewayEvent) {
  console.log({ query });

  if (!query) {
    return {
      statusCode: 400,
      body: 'Missing query',
    };
  }

  const { username } = BasicAuth.decode(event.headers["Authorization"] ?? "");
  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
  if (!streamerName) {
    return {
      statusCode: 400,
      body: 'Missing streamername',
    };
  }

  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    streamerName
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }
}
