import { ChatEventProcessor } from '@hoagie/dono-service';
import { createTwitchClient } from './createTwitchClient';
import { Config } from './Config';
import { SecretsProvider } from '@hoagie/secrets-provider';
import { EventBridgeEvent } from 'aws-lambda';

export class WriteDonos {
  public static async run(ev: EventBridgeEvent<any, any>) {
    console.log(ev);
    try {
      await SecretsProvider.init();
      console.log(`Processing ${ev['detail-type']} event`);
      const twitchClient = createTwitchClient();
      await ChatEventProcessor.process(ev, twitchClient, Config.tableName);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
