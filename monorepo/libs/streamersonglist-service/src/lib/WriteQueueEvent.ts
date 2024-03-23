import { TwitchClient } from "@hoagie/service-clients";
import { SSLEventDBWriter } from "./SSLEventDBWriter";

export interface WriteQueueEventConfig {
  tableName: string,
  twitchClient: TwitchClient
}

export class WriteQueueEvent {
  config: WriteQueueEventConfig

  constructor(config: WriteQueueEventConfig) {
    this.config = config;
  }

  public async writeEvent(ev: any) {
    console.log(ev);
    const dbWriter = new SSLEventDBWriter(this.config.tableName, this.config.twitchClient);
    await dbWriter.writeEvent(ev);

    return {
      statusCode: 200,
      body: "cool",
    }
  }
}
