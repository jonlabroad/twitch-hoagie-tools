import { TwitchWebhookEvent } from "./TwitchEvents";

export type Cheermote = {
  prefix: string;
  bits: number;
  tier: number;
};

export type Fragment = {
  type: "cheermote" | "text";
  text: string;
  cheermote: Cheermote | null;
  emote: null;
  mention: null;
};

export type Message = {
  text: string;
  fragments: Fragment[];
};

export type Badge = {
  set_id: string;
  id: string;
  info: string;
};

export type Cheer = {
  bits: number;
};

export type TwitchChatMessageEvent = {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: Message;
  color: string;
  badges: Badge[];
  message_type: string;
  cheer: Cheer;
  reply: null;
  channel_points_custom_reward_id: null;
  channel_points_animation_id: null;
};

export type TwitchChatMessageWebhookEvent = TwitchWebhookEvent<TwitchChatMessageEvent>;
