import { CreateSubscriptionInput, TwitchSubscription } from "@hoagie/service-clients";
import { createTwitchClient } from "../createTwitchClient";
import { SecretsProvider } from "@hoagie/secrets-provider";
import axios from "axios";

const subscriptionCallbackHost = "https://hoagietools-svc-prod.hoagieman.net";

export class TwitchEventSub {
  public async getSubscriptions(): Promise<TwitchSubscription[]> {
    await SecretsProvider.init();

    console.log("Listing subscriptions");
    const client = createTwitchClient();
    const subscriptions = await client.listSubscriptions();
    return subscriptions.data;
  }

  public async createSubscriptions(input: CreateSubscriptionInput[]): Promise<any[]> {
    await SecretsProvider.init();

    const secrets = SecretsProvider.getInstance().secrets;
    const subscriptionSecret = secrets["twitchWebhookSecret"];
    if (!subscriptionSecret) {
      throw new Error("Missing twitchWebhookSecret from secrets provider");
    }

    console.log("Creating subscription");
    const client = createTwitchClient();

    const responses = await Promise.all(input.map(async (subInput) => {
      try {
        const response = await client.createSubscription(subInput, subscriptionCallbackHost, subscriptionSecret, true);
        console.log({ response });
        return "Subscription created";
      } catch (e: any) {
        if (axios.isAxiosError(e) && e.response?.status === 409) {
          console.log(`Subscription already exists: ${subInput.type}`);
          return "Subscription already exists"
        } else {
          console.error(e);
          return e?.message ?? "Unknown error";
        }
      }
    }));
    return responses;
  }

  public async deleteSubscription(id: string): Promise<any> {
    await SecretsProvider.init();

    console.log(`Deleting subscription ${id}`);
    const client = createTwitchClient();
    const response = await client.deleteSubscription(id);
    console.log({ response });
  }
}
