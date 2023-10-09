import { APIGatewayEvent } from 'aws-lambda';
import {
  BasicAuth,
  ModRequestAuthorizer,
  corsHeaders,
  createCacheHeader,
  isOfflineMode,
} from '@hoagie/api-util';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { DonoDataResponse, DonoProvider } from '@hoagie/dono-service';
import { Config } from './Config';
import { createTwitchClient } from './createTwitchClient';

export class GetDonos {
  public static async run(event: APIGatewayEvent) {
    const { streamerLogin, streamId } = event.queryStringParameters ?? {};
    if (!streamerLogin || !streamId) {
      return {
        statusCode: 400,
        body: 'Missing streamerLogin or streamid',
      };
    }

    const { username } = BasicAuth.decode(event.headers.authorization ?? '');
    if (!isOfflineMode()) {
      const auth = await ModRequestAuthorizer.auth(username, event);
      if (auth) {
        return auth;
      }
    }

    await SecretsProvider.init();
    const streamIds = streamId.split(',');
    const donoProvider = new DonoProvider(
      createTwitchClient(),
      Config.tableName
    );
    const donos = await donoProvider.get(streamerLogin, streamIds);
    const responseData: DonoDataResponse = {
      data: donos,
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        ...createCacheHeader(1),
      },
      body: JSON.stringify(responseData),
    };
  }
}
