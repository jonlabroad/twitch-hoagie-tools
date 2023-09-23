import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from "@aws-sdk/client-eventbridge";

export class EventPublisher {
    private client: EventBridgeClient;

    constructor() {
        this.client = new EventBridgeClient({
            region: "us-east-1",
        });
    }

    public async send(msg: Object) {
        try {
            const entries: PutEventsRequestEntry[] = [
                {
                    Source: `hoagie.twitch-eventsub`,
                    DetailType: 'Event',
                    Detail: JSON.stringify(msg)
                }
            ];
            console.log({ publishingEvents: entries});
            const command = new PutEventsCommand({
                Entries: entries,
            });
            const response = await this.client.send(command);
            if (!!response?.FailedEntryCount) {
                console.error(response);
            }
        } catch (err) {
            console.error(err);
        }
    }
}