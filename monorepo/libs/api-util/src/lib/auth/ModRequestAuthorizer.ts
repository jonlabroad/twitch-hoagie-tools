import { corsHeaders } from '@hoagie/api-util';
import ModsDbClient from '../db/ModsDbClient';
import AdminAuthorizer from './AdminAuthorizer';

export class ModRequestAuthorizer {
  public static async auth(userId: string, streamerId: string | undefined) {
    const tableName = process.env['TABLENAME'];
    if (!tableName) {
      console.error('TABLENAME not set');
      return {
        statusCode: 500,
        body: 'TABLENAME not set',
        headers: corsHeaders,
      };
    }

    if (!userId && !streamerId) {
      console.error(`streamerName or streamerId is required`);
      return {
        statusCode: 400,
        body: `streamerName or streamerId is required`,
        headers: corsHeaders,
      };
    }

    // Allow admins
    const isAdminResponse = await AdminAuthorizer.auth(userId);
    const isAdmin = !isAdminResponse;
    if (isAdmin) {
      return undefined;
    }

    // They are who they say they are, but are they a mod?
    if (userId && streamerId) {
      const modClient = new ModsDbClient(tableName, streamerId);
      const mods = await modClient.readMods();
      const isMod = mods?.mods.map((m) => m.toLowerCase()).includes(userId);
      const isStreamer = streamerId.toLowerCase() === userId;
      if (isMod || isStreamer) {
        return undefined;
      }
      return {
        statusCode: 403,
        body: `Unauthorized, ${userId} not a mod`,
        headers: corsHeaders,
      };
    }

    console.log(`Unauthorized ${userId} at ${streamerId}`);
    return {
      statusCode: 403,
      body: `Unauthorized ${userId} ${streamerId}`,
      headers: corsHeaders,
    };
  }
}
