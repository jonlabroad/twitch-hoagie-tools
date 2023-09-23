import TwitchClient from "../twitch/TwitchClient";
import { BotDonoProcessor } from "./BotDonoProcessor";
import { getChannelName } from "./ChatEventProcessor";

export class ChatMessageProcessor {
    public static async process(event: any) {
        console.log("ChatMessageProcessor.process", event);

        const detail = event.detail;
        const username = detail.userstate.username;
        const message = detail.message;
        const channel = getChannelName(detail.channel);

        const twitchClient = new TwitchClient();
        const broadcasterId = await twitchClient.getUserId(channel);
        if (broadcasterId) {
            const liveStream = await twitchClient.getBroadcasterIdLiveStream(broadcasterId);
            if (liveStream) {
                const donoProcessor = new BotDonoProcessor(broadcasterId, liveStream.id);
                await donoProcessor.process(username, message, channel);
            } else {
                console.error(`Could not find live stream for ${broadcasterId}`)
            }
        } else {
            console.error(`Could not find broadcaster id for ${channel}`);
        }
    }
}