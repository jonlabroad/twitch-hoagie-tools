import { TwitchClient } from '@hoagie/service-clients';
import { createTwitchClient } from '../createTwitchClient';
import * as Secrets from '../../Secrets';

export class ChatClient {
  private senderId: string;
  private twitchClient: TwitchClient = createTwitchClient();

  constructor(senderId: string) {
    this.senderId = senderId;
  }

  public async sendMessage(
    broadcasterId: string,
    message: string,
    accessToken: string,
  ): Promise<any> {
    return await this.twitchClient.sendChatMessage(
      broadcasterId,
      message,
      this.senderId,
      accessToken,
    );
  }
}
