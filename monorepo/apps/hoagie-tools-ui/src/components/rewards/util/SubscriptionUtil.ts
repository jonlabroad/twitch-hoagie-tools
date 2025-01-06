import { TwitchSubscription } from "@hoagie/service-clients";

interface QueryInput {
  type: string;
  user_id?: string;
  broadcaster_user_id: string;
}

export class SubscriptionUtil {
  public static subscriptionMatches(query: QueryInput, sub: TwitchSubscription): boolean {
    const result = (
      sub.type === query.type &&
      (!query.user_id || sub.condition.user_id === query.user_id) &&
      sub.condition.broadcaster_user_id === query.broadcaster_user_id
    );
    return result;
  }
}
