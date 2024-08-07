import { TwitchClient } from '@hoagie/service-clients';
import { SecretsProvider } from '@hoagie/secrets-provider';
import * as Secrets from '../Secrets';

export function createTwitchClient() {
  return new TwitchClient({
    clientId: SecretsProvider.getInstance().secrets[`twitchClientIdProd`] ?? Secrets?.twitchClientSecrets?.twitchClientIdProd,
    serviceAuth: {
      clientSecret: SecretsProvider.getInstance().secrets[`twitchClientSecretProd`] ?? Secrets?.twitchClientSecrets?.twitchClientSecretProd,
    },
  });
}
