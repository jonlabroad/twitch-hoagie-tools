import { TwitchClient } from '@hoagie/service-clients';
import { SecretsProvider } from '@hoagie/secrets-provider';

export function createTwitchClient() {
  return new TwitchClient({
    clientId: SecretsProvider.getInstance().secrets[`twitchClientIdProd`],
    serviceAuth: {
      clientSecret: SecretsProvider.getInstance().secrets[`twitchClientSecretProd`],
    },
  });
}
