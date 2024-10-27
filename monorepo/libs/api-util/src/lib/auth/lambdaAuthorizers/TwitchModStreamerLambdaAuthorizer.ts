import { APIGatewayEvent } from 'aws-lambda';
import { TwitchLambdaAuthenticator } from '../TwitchLambdaAuthenticator';
import { ModLambdaRequestAuthorizer } from '../ModLambdaRequestAuthorizer';

export async function twitchModStreamerLamdbaAuthorizer(
  event: APIGatewayEvent,
  context: any,
  callback: (message: string | null, policy: any) => any,
  adminOnly: boolean = false
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

    if (adminOnly) {
      const auth = await ModLambdaRequestAuthorizer.auth(
        authenticationResult.userId,
        "ADMINONLY"
      );
      if (!auth || !auth.isAuthorized) {
        callback(auth.message, null);
      } else {
        callback(null, {
          isAuthorized: auth.isAuthorized,
          context: {
            userId: authenticationResult.userId,
          },
        });
      }
      return;
    }

    const streamerId = event.pathParameters?.['streamerId'] ?? event.queryStringParameters?.['streamerid'] ?? event.queryStringParameters?.['streamerid'];
    if (streamerId) {
      // User must be on the mod list
      console.log({ streamerId });
      const auth = await ModLambdaRequestAuthorizer.auth(
        authenticationResult.userId,
        streamerId
      );

      if (!auth || !auth.isAuthorized) {
        callback(auth.message, null);
      } else {
        callback(null, {
          isAuthorized: auth.isAuthorized,
          context: {
            userId: authenticationResult.userId,
          },
        });
      }
    } else {
      callback(null, {
        isAuthorized: false,
        context: {
          userId: authenticationResult.userId,
        },
      });
    }
  } catch (err: any) {
    console.error(err.message, err);
    callback("Unauthorized (authorizer error)", null);
  }
}
