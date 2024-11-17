import { ChatBot } from "./Chat/ChatBot";
import { TwitchChatMessageWebhookEvent } from "./Events/ChannelChatMessageEvent";
import TokenDbClient from "./Persistance/TokenDBClient";
import { StaticConfig } from "./StaticConfig";
import { GenerateExpiryTimestamp } from "./Tokens/Expiry";
import { RewardToken } from "./Tokens/RewardToken";

export class TwitchChatMessageHandler {
  private tokenDbClient: TokenDbClient;
  private chatBot: ChatBot;

  constructor(chatBot: ChatBot, tokenDbCLient: TokenDbClient) {
    this.chatBot = chatBot;
    this.tokenDbClient = tokenDbCLient;
  }

  public async handle(webhookEvent: TwitchChatMessageWebhookEvent): Promise<boolean> {
    const ev = webhookEvent.event;
    console.log(ev);

    const broadcasterId = ev.broadcaster_user_id;
    // TODO filter more generically, less hardcodey
    if (!StaticConfig.StreamRewardsBroadcasterIds.includes(broadcasterId) ||
        !StaticConfig.StreamRewardsChatterIds.includes(ev.chatter_user_id) ||
        ev.message.text.trimEnd() !== "!t3token") {
      return false;
    }

    const now = new Date();
    const ownerId = ev.chatter_user_id;
    const ownerUsername = ev.chatter_user_login;
    const type = "sub";
    const token: RewardToken = {
      key: type,
      type: type,
      ownerId: ownerId,
      broadcasterId: broadcasterId,
      ownerUsername: ownerUsername,
      subType: "3000",
      value: 1,
      grantTimestamp: now,
      expiryTimestamp: GenerateExpiryTimestamp(type),
    };

    await this.tokenDbClient.upsertToken(token);
    await this.chatBot.sendMessage(`Token successfully given to ${ev.chatter_user_name}`);

    return true;
  }
}
