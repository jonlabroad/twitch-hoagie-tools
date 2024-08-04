export type Condition = {
  broadcaster_user_id: string;
  user_id: string;
};

export type Transport = {
  method: string;
  callback: string;
};

export type Subscription = {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: Condition;
  transport: Transport;
  created_at: string;
  cost: number;
};

export type Badge = {
  set_id: string;
  id: string;
  info: string;
};

export type MessageFragment = {
  text: string;
  fragments: any[];
};

export interface TwitchWebhookEvent<T> {
  subscription: Subscription;
  event: T;
}

