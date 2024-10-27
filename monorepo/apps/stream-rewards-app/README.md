# Stream Rewards
Token-based rewards system. Tokens can be granted based on different actions (subscribing, bits, etc).

## Requirements
### Summary
#### Auth Scopes required
Two [authorization code grants](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow) are required:

From Broadcaster:
- `channel:bot`
- `channel:read:redemptions`

From bot user:
- `user:bot`

### Details
#### Bot
To send chat messages
From bot user:
- `user:bot` scope

From broadcaster, get auth code to allow service to chat in channel:
- `channel:bot` scope
- OR the bot user is made a moderator

#### Service
Twitch Eventsub:
- `channel.chat.notification`
  - Read subs, bits, etc notifications in chat
- `channel.chat.message`
  - Read all chat messages (for commands, etc)
- `channel.channel_points_custom_reward_redemption.add`
  - Read reward redemptions
