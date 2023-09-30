import { TwitchChatEventSourceClient } from "../client/TwitchChatEventSourceClient";

export class GetSystemStatus {
    public static async get(broadcasterId: string) {
        const chatEventSourceStatus = await TwitchChatEventSourceClient.getServiceStatus();

        return {
            chatEventSource: chatEventSourceStatus,
        }
    }
}