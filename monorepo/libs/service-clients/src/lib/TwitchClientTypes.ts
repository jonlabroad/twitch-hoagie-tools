import { Channel } from "diagnostics_channel";

export interface UserData {
  broadcaster_type: string;
  created_at: string;
  description: string;
  display_name: string;
  id: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: string;
  view_count: number;
}

export interface ChannelData {
  broadcaster_id: string;
  broadcaster_language: string;
  broadcaster_login: string;
  broadcaster_name: string;
  game_id: string;
  game_name: string;
  title: string;
}

export interface LiveChannelData {
  broadcaster_language: string;
  broadcaster_login: string;
  display_name: string;
  game_id: string;
  game_name: string;
  id: string;
  is_live: boolean;
  started_at: string;
  tag_ids: string[];
  thumbnail_url: string;
  title: string;
}

export interface UserSubscriptions {
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
  is_gift: boolean;
  tier: string;
}

export interface CreateSubscriptionInput {
  username?: string,
  userId?: string,
  type: string,
  condition: Record<string, string>,
}

export interface UserFollows {
  from_id: string;
  from_login: string;
  from_name: string;
  to_id: string;
  to_name: string;
  followed_at: string;
}

export interface StreamData {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: false;
  tags: string[]
}

export interface Game {
  id: string;
  name: string;
  box_art_url: string;
}

export interface UsersFollows {
  total: number;
  data: {
    from_id: string;
    from_login: string;
    from_name: string;
    to_id: string;
    to_name: string;
    followed_at: string;
  }[];
  pagination: {
    cursor: string;
  };
}

export interface ValidatedSession {
  client_id: string;
  expires_in: number;
  login: string;
  user_id: string;
  scopes: string[];
}

export interface TwitchSubscription {
  id: string;
  status: string;
  type: string;
  version: string;
  cost: string;
  condition: {
    user_id?: string;
    broadcaster_user_id?: string;
    to_broadcaster_user_id?: string;
    from_broadcaster_user_id?: string;
  };
  created_at: string;
  transport: {
    method: string;
    callback: string;
  };
}

export interface ValidatedSession {
  expires_in: number;
  login: string;
  user_id: string;
  client_id: string
  scopes: string[]
}

export interface UserFollows {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  followed_at: string;
}

export interface DataResponse<T> {
  data: T;
}

export interface Paginated<T> {
  total: number;
  data: T;
  pagination: {
    cursor: string;
  };
}

export interface ChannelScheduleSegment {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  canceled_until: string | null;
  category: {
    id: string;
    name: string;
  };
  is_recurring: boolean;
}

export interface ChannelSchedule {
  segments: ChannelScheduleSegment[];
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
  vacation: string | null;
}

export type ChannelScheduleResponse = Paginated<ChannelSchedule>;

export interface CustomReward {
  id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
  background_color: string;
  is_enabled: boolean;
  cost: number;
  title: string;
  prompt: string;
  is_user_input_required: boolean;
  max_per_stream_setting: {
    is_enabled: boolean;
    max_per_stream: number;
  };
  max_per_user_per_stream_setting: {
    is_enabled: boolean;
    max_per_user_per_stream: number;
  };
  global_cooldown_setting: {
    is_enabled: boolean;
    global_cooldown_seconds: number;
  };
  is_paused: boolean;
  is_in_stock: boolean;
  default_image: {
    url_1x: string;
    url_2x: string;
    url_4x: string;
  };
  should_redemptions_skip_request_queue: boolean;
  redemptions_redeemed_current_stream: number;
  cooldown_expires_at: string;
}

export interface GetCustomRewardResponse {
  data: CustomReward[];
}
