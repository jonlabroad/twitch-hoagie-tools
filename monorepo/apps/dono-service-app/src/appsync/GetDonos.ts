import { SecretsProvider } from '@hoagie/secrets-provider';
import { DonoProvider } from '@hoagie/dono-service';
import { Config } from './Config';

export class GetDonos {
  public static async run(streamerId: string, streamId: string) {
    await SecretsProvider.init();
    const streamIds = streamId.split(',');
    const donoProvider = new DonoProvider(
      Config.tableName
    );
    const donos = await donoProvider.get(streamerId, streamIds);
    return {
      streamerId,
      streamId,
      items: Object.values(donos)
    };
  }
}
