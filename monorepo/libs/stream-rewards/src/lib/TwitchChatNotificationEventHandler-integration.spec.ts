import { TwitchChatNotificationEventHandler } from "./TwitchChatNotificationEventHandler";
import { mockReSubEvent } from "./Mock/ReSubEvent";
import TokenDBClient from "./Persistance/TokenDBClient";
import { RewardToken, RewardTokenType, TokenSubType } from "./Tokens/RewardToken";

describe("TwitchChatNotificationEventHandler integration tests", () => {
  // Note: Requires local DynamoDB running at http://localhost:8000
  // See test/dynamodb/run-local-dynamodb.ps1
  let handler: TwitchChatNotificationEventHandler;

  beforeEach(() => {
    process.env["TABLENAME"] = "HoagieTools-local";
    process.env["TOKENTABLENAME"] = "HoagieRewardTokens-local"
    process.env["DYNAMODB_ENDPOINT"] = "http://localhost:8000";

    handler = new TwitchChatNotificationEventHandler();
  });

  it("should handle resub event", async () => {
    const ev = mockReSubEvent;

    const result = await handler.handle(ev);

    await expect(handler.handle(ev)).resolves.not.toThrow();
  });

  it("should handle sub event", async () => {
    const ev = mockReSubEvent;

    const result = await handler.handle(ev);

    await expect(handler.handle(ev)).resolves.not.toThrow();
  });
});

async function grantToken(userId: string, broadcasterId: string, tokenKey: string, tokenType: RewardTokenType = "sub", tokenSubType: TokenSubType = "3000") {
  const token: RewardToken = {
    ownerId: userId,
    broadcasterId: broadcasterId,
    ownerUsername: userId,
    key: tokenKey,
    type: tokenType,
    subType: tokenSubType,
    value: 1,
    grantTimestamp: new Date(),
    expiryTimestamp: new Date(),
  }

  const client = new TokenDBClient();

  await client.upsertToken(token);
}
