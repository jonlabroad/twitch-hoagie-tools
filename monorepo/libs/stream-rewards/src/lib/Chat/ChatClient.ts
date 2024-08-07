import { TwitchClient } from '@hoagie/service-clients';

export class ChatClient {
  private senderId: string;
  private twitchClient: TwitchClient;

  constructor(senderId: string, twitchClient: TwitchClient) {
    this.senderId = senderId;
    this.twitchClient = twitchClient
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
