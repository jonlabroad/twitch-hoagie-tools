import { EventBridge, PutEventsRequest, PutEventsRequestEntry } from "@aws-sdk/client-eventbridge";

export class HoagieEventPublisher {
    public static async publishToTopic<T = any>(topic: string, detail: T) {
        const eventBridge = new EventBridge();
        const source = "hoagie.topic";
        const detailType = topic;
        const event: PutEventsRequestEntry = {
            Source: source,
            DetailType: detailType,
            Detail: JSON.stringify({
                ...detail,
                topic,
            })
        }

        const params: PutEventsRequest = {
            Entries: [
                event
            ]
        }

        try {
            console.log(`Publishing to topic '${topic}'`);
            console.log(params);
            await eventBridge.putEvents(params);
        } catch(err: any) {
            console.error(`Failed to publish a topic '${topic}' event: ${err.message}`)
        }
    }
}