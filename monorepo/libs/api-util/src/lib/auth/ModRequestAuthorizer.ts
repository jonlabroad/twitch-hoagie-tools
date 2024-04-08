import { corsHeaders } from '@hoagie/api-util';
import ModsDbClient from '../db/ModsDbClient';
import AdminAuthorizer from './AdminAuthorizer';

export class ModRequestAuthorizer {
  public static async auth(username: string, streamerName: string | undefined, streamerId: string | undefined) {
    const tableName = process.env['TABLENAME'];
    if (!tableName) {
      console.error('TABLENAME not set');
      return {
        statusCode: 500,
        body: 'TABLENAME not set',
        headers: corsHeaders,
      };
    }

    if (!streamerName && !streamerId) {
      console.error(`streamerName or streamerId is required`);
      return {
        statusCode: 400,
        body: `streamerName or streamerId is required`,
        headers: corsHeaders,
      };
    }

    // Allow admins
    const isAdminResponse = await AdminAuthorizer.auth(username);
    const isAdmin = !isAdminResponse;
    if (isAdmin) {
      return undefined;
    }

    // They are who they say they are, but are they a mod?
    if (username && streamerName) {
      const modClient = new ModsDbClient(tableName, streamerName);
      const mods = await modClient.readMods();
      const isMod = mods?.mods.map((m) => m.toLowerCase()).includes(username);
      const isStreamer = streamerName.toLowerCase() === username;
      if (isMod || isStreamer) {
        return undefined;
      }
      return {
        statusCode: 403,
        body: `Unauthorized, ${username} not a mod`,
        headers: corsHeaders,
      };
    }

    console.log(`Unauthorized ${username} at ${streamerName}`);
    return {
      statusCode: 403,
      body: `Unauthorized ${username} ${streamerName}`,
      headers: corsHeaders,
    };
  }
}
