import { ModsDbClientV2, corsHeaders } from '@hoagie/api-util';
import ModsDbClient from '../db/ModsDbClient';
import AdminAuthorizer from './AdminAuthorizer';
import NodeCache from 'node-cache';

interface AuthorizationResult {
  userId: string;
  isAuthorized: boolean;
  message: string;
}

const authCache = new NodeCache({ stdTTL: 30 * 60, checkperiod: 60 });

export class ModLambdaRequestAuthorizer {
  public static async auth(userId: string, streamerId: string | undefined): Promise<AuthorizationResult> {
    const cachedAuth = authCache.get(`${userId}:${streamerId}`) as AuthorizationResult | undefined;
    if (cachedAuth && cachedAuth.isAuthorized) {
      console.log(`ModLambdaRequestAuthorizer: Using cached auth for ${userId}:${streamerId}`);
      return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
        userId,
        isAuthorized: cachedAuth.isAuthorized,
        message: cachedAuth.message,
      });
    }

    const tableName = process.env['TABLENAME'];
    if (!tableName) {
      console.error('TABLENAME not set');
      return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
        userId,
        isAuthorized: false,
        message: 'TABLENAME not set',
      });
    }

    if (!userId && !streamerId) {
      console.error(`streamerName or streamerId is required`);
      return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
        userId,
        isAuthorized: false,
        message: `streamerName or streamerId is required`,
      });
    }

    // Allow admins
    const isAdminResponse = await AdminAuthorizer.auth(userId);
    const isAdmin = !isAdminResponse;
    if (isAdmin) {
      return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
        userId,
        isAuthorized: true,
        message: '',
      });
    }

    // They are who they say they are, but are they a mod?
    if (userId && streamerId) {
      const modClient = new ModsDbClientV2(tableName, {
        broadcasterId: streamerId
      });
      const mods = await modClient.readMods();
      const isMod = mods?.mods.map((m) => m.toLowerCase()).includes(userId);
      const isStreamer = streamerId.toLowerCase() === userId;
      if (isMod || isStreamer) {
        return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
          userId,
          isAuthorized: true,
          message: '',
        });
      }
      return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
        userId,
        isAuthorized: false,
        message: `Unauthorized, ${userId} not a mod`,
      });
    }

    console.log(`Unauthorized ${userId} at ${streamerId}`);
    return ModLambdaRequestAuthorizer.saveCachedAuth(streamerId, {
      userId,
      isAuthorized: false,
      message: `Unauthorized ${userId} ${streamerId}`,
    });
  }

  private static saveCachedAuth(streamerId: string | undefined, authResult: AuthorizationResult) {
    if (streamerId) {
      const key = `${authResult.userId}:${streamerId}`;
      authCache.set(key, authResult);
    }
    return authResult;
  }
}
