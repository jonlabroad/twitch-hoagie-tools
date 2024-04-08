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
  public static async run(streamerId: string | undefined, event: APIGatewayEvent) {
    if (!streamerId) {
      throw new Error(`streamerId is required`);
    }

    const { streamId } = event.queryStringParameters ?? {};
    if (!streamId) {
      return {
        statusCode: 400,
        body: 'Missing streamerId or streamid',
      };
    }

    const { username } = BasicAuth.decode(event.headers.authorization ?? '');
    if (!isOfflineMode()) {
      const auth = await ModRequestAuthorizer.auth(username, undefined, streamerId);
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
    const donos = await donoProvider.get(streamerId, streamIds);
    const responseData: DonoDataResponse = {
      data: donos,
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        ...createCacheHeader(3),
      },
      body: JSON.stringify(responseData),
    };
  }
}
