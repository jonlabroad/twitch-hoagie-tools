import { ChatBot } from "./Chat/ChatBot";
import { HandlerResult } from "./EventHandlers/HandlerResult";
import { SongListRequestHandler } from "./EventHandlers/SongListRequestHandler";
import { SubHandler } from "./EventHandlers/SubHandler";
import { TwitchNotificationEvent } from "./Events/ChannelChatNotificationEvent";
import { ChannelPointRedemptionEvent } from "./Events/ChannelPointRedemptionEvent";

type RewardType = "improvRequest" | "liveLearnRequest";

interface RewardConfig {
  rewardId: string | null;
  rewardTitle: string;
}

// TODO put this in db with UI configurator
const config: Record<RewardType, RewardConfig | null> = {
  improvRequest: {
    rewardId: null,
    rewardTitle: "Request: Improv",
  },
  liveLearnRequest: {
    rewardId: null,
    rewardTitle: "Request: Live Learn",
  }
}

export class TwitchRewardRedemptionHandler {
  private chatBot: ChatBot;

  constructor(chatBot: ChatBot) {
    this.chatBot = chatBot;
  }

  public async handle(ev: ChannelPointRedemptionEvent): Promise<boolean> {
    console.log(ev);

    //await this.chatBot.sendMessage(`Redeeming reward for ${ev.user_name}: ${ev.reward.title}`);
    const improvRequestHandler = new SongListRequestHandler("Improv", this.chatBot);
    const liveLearnRequestHandler = new SongListRequestHandler("Live Learn", this.chatBot);

    let result: HandlerResult | undefined = undefined;
    if (this.isRewardType(ev, "improvRequest")) {
      result = await improvRequestHandler.handle(ev);
    } else if (this.isRewardType(ev, "liveLearnRequest")) {
      result = await liveLearnRequestHandler.handle(ev);
    }

    if (!result?.success && this.chatBot) {
      //await this.chatBot.sendMessage(`Failed to redeem reward for ${ev.user_name}`);
      await this.chatBot.sendMessage(`${ev.user_name}, T3 sub is required, limit 1 per monthly sub`);
    }

    if (result?.chatMessage && this.chatBot) {
      await this.chatBot.sendMessage(result.chatMessage);
    }

    return result?.success ?? false;
  }

  private isRewardType(ev: ChannelPointRedemptionEvent, rewardType: RewardType): boolean {
    const rewardConfig = config[rewardType];
    if (!rewardConfig) {
      return false;
    }

    return (ev.reward.title.toLowerCase() === rewardConfig.rewardTitle.toLowerCase()) ||
      (!!rewardConfig.rewardId && ev.reward.id === rewardConfig.rewardId);
  }
}
