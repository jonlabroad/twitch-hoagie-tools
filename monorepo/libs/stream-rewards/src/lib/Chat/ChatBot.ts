import { TwitchClient } from "@hoagie/service-clients";
import { ChatClient } from "./ChatClient";
import { ConfigDBClient } from "@hoagie/config-service";

export class ChatBot {
  private botId: string;
  private channelId: string;
  private chatClient: ChatClient;
  private tokenDbClient: ConfigDBClient;

  constructor(botId: string, channelId: string, chatClient: ChatClient, tokenDbClient: ConfigDBClient) {
    this.botId = botId;
    this.channelId = channelId;
    this.chatClient = chatClient;
    this.tokenDbClient = tokenDbClient;
  }

  public async sendTestMessage() {
    const accessToken = await this.readAccessToken(this.botId);
    await this.chatClient.sendMessage(this.channelId, "Hoagie Bot is connected and ready to go!", accessToken);
  }

  public async sendMessage(message: string) {
    const accessToken = await this.readAccessToken(this.botId);
    await this.chatClient.sendMessage(this.channelId, message, accessToken);
  }

  private async readAccessToken(userId: string): Promise<string> {
    // TODO cache the token
    // *** TODO create a token provider that can automatically refresh the token and save back to the DB if necessary ***
    const tokenData = await this.tokenDbClient.getAccessToken(userId, "USER"); // TODO use the BOT category
    return tokenData.access_token;
  }
}
