import DonoDbClientV2 from "../channelDb/DonoDbClientV2";
import { getChannelName } from "./ChatEventProcessor";

interface ChannelConfig {
  botUsername: string;
  donoMessageRegex: RegExp;
}

// TODO move this to cloud streamer config
const channelConfigs: Record<string, ChannelConfig> = {
  andrewcore: {
    botUsername: "corebot5000",
    donoMessageRegex:
      /DONO ARIGATO! (?<username>\S+).+\$(?<amount>[0-9]+\.[0-9]+)/,
  },
  joplaysviolin: {
    botUsername: "streamelements",
    donoMessageRegex:
      /[^a-zA-z]*(?<username>.+) just tipped \$(?<amount>[0-9]+\.[0-9]+)/,
  },
  thesongery: {
    botUsername: "streamelements",
    donoMessageRegex: /(?<username>\S+).+\$(?<amount>[0-9]+\.[0-9]+)/,
  },
};

export class BotDonoProcessor {
  broadcasterId: string;
  streamId: string;

  constructor(broadcasterId: string, streamId: string) {
    this.broadcasterId = broadcasterId;
    this.streamId = streamId;
  }

  public async process(uuid: string, username: string, chatMessage: string) {
    const config = channelConfigs[getChannelName(this.broadcasterId)];
    if (!config) {
      throw new Error(
        `Unable to find channel config for broadcasterId ${this.broadcasterId}`
      );
    }
    if (username.toLowerCase() === config.botUsername.toLowerCase()) {
      const match = chatMessage.match(config.donoMessageRegex);
      if (match) {
        const amountMatch = match.groups?.amount;
        const amount = parseFloat(amountMatch ?? "0");
        const dbWriter = new DonoDbClientV2(this.broadcasterId);
        console.log({ uuid, username, streamId: this.streamId, amount });
        await dbWriter.addDono(uuid, username.toLowerCase(), this.streamId, amount);
      }
    }
  }
}
