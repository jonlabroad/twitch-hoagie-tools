import { TwitchRewardRedemptionHandler } from "./TwitchRewardRedemptionHandler";
import { ChannelPointRedemptionEvent } from "./Events/ChannelPointRedemptionEvent";

import { createDocClient } from "@hoagie/api-util";
// Mock the dependencies
jest.mock("@aws-sdk/lib-dynamodb", () => ({
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
}));

jest.mock("@hoagie/api-util", () => ({
  createDocClient: jest.fn(),
}));

// Mock implementation of createDocClient
const mockDocClient = {
  send: jest.fn().mockResolvedValue({
    "$metadata": {
      httpStatusCode: 200,
    },
  }),
};
(createDocClient as jest.Mock).mockReturnValue(mockDocClient);

const mockRedemptionEvent: ChannelPointRedemptionEvent = {
  broadcaster_user_id: "11111",
  broadcaster_user_login: "broadcast_user_login",
  broadcaster_user_name: "broadcast_user_name",
  user_id: "22222",
  user_login: "mockUser",
  user_name: "mockUser",
  user_input: "this is test input",
  status: "unfulfilled",
  reward: {
      id: "rewardId",
      title: "rewardTitle",
      cost: 1,
      prompt: "rewardPrompt",
  },
  redeemed_at: "2021-09-01T00:00:00Z",
}

describe("TwitchRewardRedemptionHandler", () => {
  let handler: TwitchRewardRedemptionHandler;

  beforeEach(() => {
    handler = new TwitchRewardRedemptionHandler();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it("should handle improvRequest redemption event", async () => {
    const event: ChannelPointRedemptionEvent = {
      ...mockRedemptionEvent,
      reward: {
        id: "rewardId",
        title: "Request: Improv",
        cost: 1,
        prompt: "rewardPrompt",
      },
    };

    const result = await handler.handle(event);

    await expect(result).toBe(true);
  });

  it("should handle liveLearn redemption event", async () => {
    const event: ChannelPointRedemptionEvent = {
      ...mockRedemptionEvent,
      reward: {
        id: "rewardId",
        title: "Request: Live Learn",
        cost: 1,
        prompt: "rewardPrompt",
      },
    };

    const result = await handler.handle(event);

    await expect(result).toBe(true);
  });

  it("should fail to handle unknown redemption event", async () => {
    const event: ChannelPointRedemptionEvent = {
      ...mockRedemptionEvent,
      reward: {
        id: "unknownRewardId",
        title: "Unknown Reward",
        cost: 1,
        prompt: "derp",
      },
    };

    const result = await handler.handle(event);

    await expect(result).toBe(false);
  });
});
