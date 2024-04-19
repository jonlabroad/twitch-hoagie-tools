import { APIGatewayProxyEvent } from 'aws-lambda';
import NodeCache from 'node-cache';
import { BasicAuth } from './BasicAuth';
import { TwitchClient, ValidatedSession } from '@hoagie/service-clients';

interface CachedAuthenticationType {
  session: ValidatedSession;
  expiry: Date;
}

const authCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 });

export class TwitchLambdaAuthenticator {
  public async authenticate(
    event: APIGatewayProxyEvent,
    context: any,
    callback: (message: string | null, policy: any) => any
  ) {
    try {
      const authHeader = event.headers['authorization'] ?? event.headers['Authorization'];
      if (!authHeader) {
        return callback('Unauthorized (no Authorization header found)', null);
      }

      const { username: userId, token } = BasicAuth.decode(authHeader);
      console.log({ userId });
      let validatedSession = this.getCachedAuthentication(userId, token);
      if (!validatedSession) {
        console.log("Validating with Twitch");
        validatedSession = await TwitchLambdaAuthenticator.authenticateWithTwitch(userId, token);
        if (!validatedSession) {
          return callback('Unauthorized (invalid Twitch credentials)', null);
        }
        this.setCachedAuthentication(userId, token, validatedSession);
      } else {
        console.log("Using cached authentication");
      }
      callback(null, {
        isAuthorized: true,
        context: {
          userId,
        },
      })
    } catch (err: any) {
      console.error(err.message, err);
      return callback('Unauthorized (error)', null);
    }
  }

  public static async authenticateWithTwitch(userId: string, token: string): Promise<ValidatedSession | null | undefined> {
    const validationResponse = await TwitchClient.validateUserIdAndToken(
      userId,
      token
    );
    if (!validationResponse.validatedSession || !validationResponse.validated) {
      console.log('User and token combination invalid');
      return null;
    }

    return validationResponse.validatedSession;
  }

  private getCachedAuthentication(userId: string, token: string): ValidatedSession | null | undefined {
    const key = `${userId}:${token}`;
    const session = authCache.get(key) as CachedAuthenticationType | undefined;
    if (session) {
      const now = new Date();
      if (now.getTime() >= session.expiry.getTime()) {
        return null;
      }
      return session.session;
    }
    return null;
  }

  private setCachedAuthentication(userId: string, token: string, session: ValidatedSession) {
    const key = `${userId}:${token}`;
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + session.expires_in);
    authCache.set(key, { session, expiry });
  }
}
