import { TwitchChatNotificationEventHandler } from "./TwitchChatNotificationEventHandler";
import { mockReSubEvent } from "./Mock/ReSubEvent";
import { mockSubEvent } from "./Mock/SubEvent";
import { createDocClient } from "./util/DBUtil";

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
  send: jest.fn(),
};
(createDocClient as jest.Mock).mockReturnValue(mockDocClient);

describe("TwitchChatNotificationEventHandler unit tests", () => {
  let handler: TwitchChatNotificationEventHandler;

  beforeEach(() => {
    handler = new TwitchChatNotificationEventHandler();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it("should write a token for sub event", async () => {
    const ev = mockSubEvent;

    const result = await handler.handle(ev);

    expect(mockDocClient.send).toHaveBeenCalledTimes(1);
  });

  it("should write a token for resub event", async () => {
    const ev = mockReSubEvent;

    const result = await handler.handle(ev);

    expect(mockDocClient.send).toHaveBeenCalledTimes(1);
  });

  it("should not write a token for gifted resub event", async () => {
    const ev = mockReSubEvent;
    ev.resub!.is_gift = true;

    const result = await handler.handle(ev);

    expect(mockDocClient.send).not.toHaveBeenCalled();
  });

  it("should not write a token for prime resub event", async () => {
    const ev = mockReSubEvent;
    ev.resub!.is_prime = true;

    const result = await handler.handle(ev);

    expect(mockDocClient.send).not.toHaveBeenCalled();
  });

  it("should not write a token for prime sub event", async () => {
    const ev = mockSubEvent;
    ev.sub!.is_prime = true;

    const result = await handler.handle(ev);

    expect(mockDocClient.send).not.toHaveBeenCalled();
  });
});
