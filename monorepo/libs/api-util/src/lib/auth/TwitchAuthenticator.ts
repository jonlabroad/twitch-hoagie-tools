import { BasicAuth, corsHeaders, getAuthHeaderFromEvent } from '@hoagie/api-util';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { TwitchClient } from '@hoagie/service-clients';

export class TwitchRequestAuthenticator {
  public static async authFromRequest(event: APIGatewayProxyEvent) {
    console.log({ event });
    const { username: userId, token } = BasicAuth.decode(getAuthHeaderFromEvent(event) ?? '');
    if (!userId || !token) {
      return {
        statusCode: 401,
        body: 'Unauthorized',
        headers: corsHeaders,
      };
    }

    console.log({ userId, token })
    const validationResponse = await TwitchClient.validateUserIdAndToken(
      userId,
      token
    );
    if (!validationResponse.validated) {
      return {
        statusCode: 401,
        body: 'User and token combination invalid',
        headers: corsHeaders,
      };
    }

    return undefined;
  }
}
