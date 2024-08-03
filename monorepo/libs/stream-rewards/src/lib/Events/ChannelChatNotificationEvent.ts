type Condition = {
  broadcaster_user_id: string;
  user_id: string;
};

type Transport = {
  method: string;
  callback: string;
};

type AWSSubscription = {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
};

type Badge = {
  set_id: string;
  id: string;
  info: string;
};

type MessageFragment = {
  text: string;
  fragments: any[];
};

interface Sub {
  sub_tier: '1000' | '2000' | '3000';
  is_prime: boolean;
  duration_months?: number;
}

interface Resub {
  cumulative_months: number;
  duration_months: number;
  streak_months: number | null;
  sub_tier: '1000' | '2000' | '3000';
  is_prime: boolean;
  is_gift: boolean;
  gifter_is_anonymous: boolean | null;
  gifter_user_id: string | null;
  gifter_user_name: string | null;
  gifter_user_login: string | null;
}

interface SubGift {
  duration_months: number;
  cumulative_total: number | null;
  recipient_user_id: string;
  recipient_user_name: string;
  recipient_user_login: string;
  sub_tier: '1000' | '2000' | '3000';
  community_gift_id: string | null;
}

interface TwitchNotificationEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  chatter_is_anonymous: boolean;
  color: string;
  badges: Badge[];
  system_message: string;
  message_id: string;
  message: MessageFragment;
  notice_type: NoticeType;
  sub: Sub | null;
  resub: Resub | null;
  sub_gift: SubGift | null; // TODO
  community_sub_gift: any | null; // TODO
  gift_paid_upgrade: any | null;
  prime_paid_upgrade: any | null;
  pay_it_forward: any | null;
  raid: any | null;
  unraid: any | null;
  announcement: any | null;
  bits_badge_tier: any | null;
  charity_donation: any | null;
}

interface TwitchWebhookEvent<T> {
  subscription: AWSSubscription;
  event: T;
}

interface EventBridgeEvent<T> {
  Source: string;
  DetailType: string;
  Detail: TwitchWebhookEvent<T>;
}

export type TwitchChatNotificationEvent =
  EventBridgeEvent<TwitchNotificationEvent>;

export type NoticeType =
  | 'sub'
  | 'resub'
  | 'sub_gift'
  | 'community_sub_gift'
  | 'gift_paid_upgrade'
  | 'prime_paid_upgrade'
  | 'raid'
  | 'unraid'
  | 'pay_it_forward'
  | 'announcement'
  | 'bits_badge_tier'
  | 'charity_donation';
