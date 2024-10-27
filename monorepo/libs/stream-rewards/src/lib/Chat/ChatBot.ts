import { AccessTokenProvider } from "@hoagie/api-util";
import { ChatClient } from "./ChatClient";

export class ChatBot {
  private botId: string;
  private channelId: string;
  private chatClient: ChatClient;
  private accessTokenProvider: AccessTokenProvider;

  constructor(botId: string, channelId: string, chatClient: ChatClient, accessTokenProvider: AccessTokenProvider) {
    this.botId = botId;
    this.channelId = channelId;
    this.chatClient = chatClient;
    this.accessTokenProvider = accessTokenProvider;
  }

  public async sendTestMessage() {
    const accessToken = await this.readAccessToken(this.botId);
    await this.chatClient.sendMessage(this.channelId, "Hoagie Bot is here!", accessToken);
  }

  public async sendMessage(message: string) {
    const accessToken = await this.readAccessToken(this.botId);
    await this.chatClient.sendMessage(this.channelId, message, accessToken);
  }

  private async readAccessToken(userId: string): Promise<string> {
    const tokenData = await this.accessTokenProvider.readToken(userId, "BOT");
    return tokenData?.access_token ?? "NO_TOKEN";
  }
}
