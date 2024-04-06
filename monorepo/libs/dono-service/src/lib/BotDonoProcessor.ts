import { HoagieEventPublisher } from "@hoagie/api-util";
import { getChannelName } from "./ChatEventProcessor";
import DonoDbClient from "./DonoDbClient";
import { TwitchClient } from "@hoagie/service-clients";


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
  hoagieman5000: {
    botUsername: "hoagieman5000",
    donoMessageRegex: /DONO ARIGATO! (?<username>\S+).+\$(?<amount>[0-9]+\.[0-9]+)/,
  },
};

export class BotDonoProcessor {
  broadcasterId: string;
  streamId: string;
  tableName: string;
  twitchClient: TwitchClient;

  constructor(broadcasterId: string, streamId: string, tableName: string,  twitchClient: TwitchClient) {
    this.broadcasterId = broadcasterId;
    this.streamId = streamId;
    this.tableName = tableName;
    this.twitchClient = twitchClient;
  }

  public async process(uuid: string, channel: string, username: string, chatMessage: string) {
    const config = channelConfigs[getChannelName(channel)];
    if (!config) {
      console.log(`Unable to find channel config for channel ${channel}`);
    }

    if (config?.botUsername === username.toLowerCase()) {
      const match = chatMessage.match(config.donoMessageRegex);
      if (match) {
        const amountMatch = match.groups?.["amount"];
        const donator = match.groups?.["username"] ?? "ERROR";
        const amount = parseFloat(amountMatch ?? "0");
        const dbWriter = new DonoDbClient(this.broadcasterId, this.tableName);
        console.log({ uuid, username, streamId: this.streamId, amount });
        let userId: string | undefined = undefined;
        try {
          userId = await this.twitchClient.getUserId(donator.toLowerCase());
        } catch (err) {
          console.log(err);
        }

        await dbWriter.addDono(uuid, donator.toLowerCase(), this.streamId, amount, userId);
        await HoagieEventPublisher.publishToTopic(`dono.${this.broadcasterId}`, {});
      }
    }
  }
}
