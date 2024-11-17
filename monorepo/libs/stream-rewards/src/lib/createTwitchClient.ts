import { TwitchClient, TwitchClientOptions } from '@hoagie/service-clients';
import { SecretsProvider } from '@hoagie/secrets-provider';

export function createTwitchClient(accessToken?: string) {
  const clientOptions = {
    clientId: SecretsProvider.getInstance().secrets[`twitchClientIdProd`],
    serviceAuth: {
      clientSecret: SecretsProvider.getInstance().secrets[`twitchClientSecretProd`],
    },
  } as TwitchClientOptions;

  if (accessToken) {
    clientOptions.clientAuth = {
      accessToken,
    };
  }

  return new TwitchClient(clientOptions);
}
