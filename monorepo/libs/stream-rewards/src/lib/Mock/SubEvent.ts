import { TwitchNotificationEvent } from '../Events/ChannelChatNotificationEvent';

export const mockSubEvent: TwitchNotificationEvent = {
  broadcaster_user_id: '118391771',
  broadcaster_user_login: 'thesongery',
  broadcaster_user_name: 'TheSongery',
  chatter_user_id: '408982109',
  chatter_user_login: 'hoagieman5000',
  chatter_user_name: 'HoagieMan5000',
  chatter_is_anonymous: false,
  color: '#FF7512',
  badges: [
    {
      set_id: 'moderator',
      id: '1',
      info: '',
    },
    {
      set_id: 'subscriber',
      id: '3012',
      info: '43',
    },
    {
      set_id: 'bits-leader',
      id: '2',
      info: '',
    },
  ],
  system_message:
    "HoagieMan5000 subscribed at Tier 3. They've subscribed for 43 months!",
  message_id: 'bcec22a7-d578-4f93-afb9-e96296ee14b6',
  message: {
    text: 'songeryPoe songeryPoe songeryPoe',
    fragments: [
      {
        type: 'emote',
        text: 'songeryPoe',
        cheermote: null,
        emote: {
          id: 'emotesv2_71c5395e9eac41cb8e18720f4f99e9ef',
          emote_set_id: '1570752',
          owner_id: '118391771',
          format: ['static'],
        },
        mention: null,
      },
      {
        type: 'text',
        text: ' ',
        cheermote: null,
        emote: null,
        mention: null,
      },
      {
        type: 'emote',
        text: 'songeryPoe',
        cheermote: null,
        emote: {
          id: 'emotesv2_71c5395e9eac41cb8e18720f4f99e9ef',
          emote_set_id: '1570752',
          owner_id: '118391771',
          format: ['static'],
        },
        mention: null,
      },
      {
        type: 'text',
        text: ' ',
        cheermote: null,
        emote: null,
        mention: null,
      },
      {
        type: 'emote',
        text: 'songeryPoe',
        cheermote: null,
        emote: {
          id: 'emotesv2_71c5395e9eac41cb8e18720f4f99e9ef',
          emote_set_id: '1570752',
          owner_id: '118391771',
          format: ['static'],
        },
        mention: null,
      },
    ],
  },
  notice_type: 'resub',
  sub: {
    duration_months: 12,
    sub_tier: '3000',
    is_prime: false,
  },
  resub: null,
  sub_gift: null,
  community_sub_gift: null,
  gift_paid_upgrade: null,
  prime_paid_upgrade: null,
  pay_it_forward: null,
  raid: null,
  unraid: null,
  announcement: null,
  bits_badge_tier: null,
  charity_donation: null,
};
