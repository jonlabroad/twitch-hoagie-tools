import { ChatBot } from "./Chat/ChatBot";
import { HandlerResult } from "./EventHandlers/HandlerResult";
import { SongListRequestHandler } from "./EventHandlers/SongListRequestHandler";
import { ChannelPointRedemptionEvent } from "./Events/ChannelPointRedemptionEvent";
import { IRewardType } from "./IRewardType";
import RewardConfigDBClient from "./Persistance/RewardConfigDBClient";

export class TwitchRewardRedemptionHandler {
  private chatBot: ChatBot;

  constructor(chatBot: ChatBot) {
    this.chatBot = chatBot;
  }

  public async handle(ev: ChannelPointRedemptionEvent): Promise<HandlerResult[]> {
    console.log(ev);

    //await this.chatBot.sendMessage(`Redeeming reward for ${ev.user_name}: ${ev.reward.title}`);
    const improvRequestHandler = new SongListRequestHandler("Improv", this.chatBot);
    const liveLearnRequestHandler = new SongListRequestHandler("Live Learn", this.chatBot);

    const rewardsDbClient = new RewardConfigDBClient();
    const rewardsConfig = await rewardsDbClient.read(ev.broadcaster_user_id);

    if (!rewardsConfig || rewardsConfig.rewards.length <= 0) {
      console.warn(`No rewards config found for broadcaster ${ev.broadcaster_user_id}`);
      return [];
    }

    const redeemedId = ev.reward.id;
    const configsForRewardId = rewardsConfig.rewards.filter((r) => r.enabled && r.redemptionId === redeemedId);
    if (configsForRewardId.length <= 0) {
      console.log(`No reward config found for ${ev.reward.title}`);
      return [];
    }

    const results = await Promise.all(configsForRewardId.map(async (config) => {
      let result: HandlerResult | undefined = undefined;
      if (config.handlerType === "improvRequest") {
        result = await improvRequestHandler.handle(ev);
      } else if (config.handlerType === "liveLearnRequest") {
        result = await liveLearnRequestHandler.handle(ev);
      }

      if (!result?.success && this.chatBot) {
        //await this.chatBot.sendMessage(`Failed to redeem reward for ${ev.user_name}`);
        await this.chatBot.sendMessage(`${ev.user_name}, T3 sub is required, limit 1 per monthly sub`);
      }

      if (result?.chatMessage && this.chatBot) {
        await this.chatBot.sendMessage(result.chatMessage);
      }

      return result;
    }));

    return results.filter((r) => !!r) as HandlerResult[];
  }
}
