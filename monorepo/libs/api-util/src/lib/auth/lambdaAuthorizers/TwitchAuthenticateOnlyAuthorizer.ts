import { APIGatewayEvent } from 'aws-lambda';
import { TwitchLambdaAuthenticator } from '../TwitchLambdaAuthenticator';

export async function twitchAuthenticateOnlyAuthorizer(
  event: APIGatewayEvent,
  context: any,
  callback: (message: string | null, policy: any) => any,
) {
  try {
    const authenticator = new TwitchLambdaAuthenticator();
    const authenticationResult = await authenticator.authenticate(
      event,
      context
    );
    if (!authenticationResult.isAuthenticated) {
      console.log(`Unauthorized user: ${authenticationResult.userId}`);
      callback(authenticationResult.message, null);
    }

    callback(null, {
      isAuthorized: true,
      context: {
        userId: authenticationResult.userId,
      },
    });
  } catch (err: any) {
    console.error(err.message, err);
    callback("Unauthorized (authorizer error)", null);
  }
}
