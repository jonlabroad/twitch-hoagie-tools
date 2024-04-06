import { TwitchClient } from "@hoagie/service-clients";
import { BotDonoProcessor } from "./BotDonoProcessor";
import { getChannelName } from "./ChatEventProcessor";

export class ChatMessageProcessor {
    public static async process(event: any, twitchClient: TwitchClient, tableName: string) {
        console.log("ChatMessageProcessor.process", event);

        const detail = event.detail;
        const username = detail.userstate.username;
        const userId = detail.userstate["user-id"];
        const message = detail.message;
        const channel = getChannelName(detail.channel);

        const broadcasterId = await twitchClient.getUserId(channel);
        if (broadcasterId) {
            const liveStream = await twitchClient.getBroadcasterIdLiveStream(broadcasterId);
            if (liveStream) {
                const donoProcessor = new BotDonoProcessor(broadcasterId, liveStream.id, tableName, twitchClient);
                await donoProcessor.process(detail.userstate.id, channel, username, userId, message);
            } else {
                console.error(`Could not find live stream for ${broadcasterId}`);
            }
        } else {
            console.error(`Could not find broadcaster id for ${channel}`);
        }
    }
}
