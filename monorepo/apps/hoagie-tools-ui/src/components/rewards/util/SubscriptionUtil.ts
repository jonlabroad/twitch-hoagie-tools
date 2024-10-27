import { TwitchSubscription } from "@hoagie/service-clients";

interface QueryInput {
  type: string;
  broadcaster_user_id: string;
}

export class SubscriptionUtil {
  public static subscriptionMatches(query: QueryInput, sub: TwitchSubscription): boolean {
    return (
      sub.type === query.type &&
      sub.condition.broadcaster_user_id === query.broadcaster_user_id
    )
  }
}
