import { YoutubeChatRepository, YoutubeLiveInfo } from "./youtubeChatRepo";
import { YoutubeChatMessageData } from "../messages/messages";

describe("YoutubeChatRepository", () => {
  let repo: YoutubeChatRepository;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Channel initialization and listing", () => {
    it("should add new channels to the list on initialization", () => {
      repo = new YoutubeChatRepository();

      // Initialize channels
      repo.initializeChannel("video123", "Channel One");
      repo.initializeChannel("video456", "Channel Two");

      const channels = repo.getChannels();

      expect(channels).toHaveLength(2);
      expect(channels).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            videoId: "video123",
            channelName: "Channel One",
            idle: false,
          }),
          expect.objectContaining({
            videoId: "video456",
            channelName: "Channel Two",
            idle: false,
          }),
        ])
      );
    });

    it("should not duplicate channels if initialized multiple times", () => {
      repo = new YoutubeChatRepository();

      repo.initializeChannel("video123", "Channel One");
      repo.initializeChannel("video123", "Channel One");

      const channels = repo.getChannels();

      expect(channels).toHaveLength(1);
    });
  });

  describe("Channel idle timeout", () => {
    it("should mark channels as idle after the idle timeout", () => {
      const idleTimeoutMs = 60000; // 1 minute
      repo = new YoutubeChatRepository({ idleTimeoutMs });

      repo.initializeChannel("video123", "Channel One");

      // Channel should be active initially
      let channels = repo.getChannels();
      expect(channels[0].idle).toBe(false);

      // Fast-forward time past the idle timeout
      jest.advanceTimersByTime(idleTimeoutMs + 600);

      // Channel should now be idle
      channels = repo.getChannels();
      expect(channels[0].idle).toBe(true);
    });

    it("should still return idle channels in the channels list", () => {
      const idleTimeoutMs = 60000;
      repo = new YoutubeChatRepository({ idleTimeoutMs });

      repo.initializeChannel("video123", "Channel One");

      // Fast-forward time past the idle timeout
      jest.advanceTimersByTime(idleTimeoutMs + 600);

      const channels = repo.getChannels();
      expect(channels).toHaveLength(1);
      expect(channels[0].idle).toBe(true);
    });

    it("should trigger idle callback when channel becomes idle", () => {
      const idleTimeoutMs = 60000;
      repo = new YoutubeChatRepository({ idleTimeoutMs });
      const idleCallback = jest.fn();

      repo.subscribeChannelIdle(idleCallback);
      repo.initializeChannel("video123", "Channel One");

      // Fast-forward time past the idle timeout
      jest.advanceTimersByTime(idleTimeoutMs + 600);

      expect(idleCallback).toHaveBeenCalledWith(
        "video123",
        expect.objectContaining({
          videoId: "video123",
          channelName: "Channel One",
          idle: true,
        })
      );
    });
  });

  describe("Channel reactivation", () => {
    it("should mark channels as active again when receiving heartbeat after idle", () => {
      const idleTimeoutMs = 60000;
      repo = new YoutubeChatRepository({ idleTimeoutMs });

      repo.initializeChannel("video123", "Channel One");

      // Fast-forward time past the idle timeout
      jest.advanceTimersByTime(idleTimeoutMs + 600);

      let channels = repo.getChannels();
      expect(channels[0].idle).toBe(true);

      // Send a heartbeat to reactivate
      repo.handleHeartbeat({
        videoId: "video123",
        channelName: "Channel One",
        idle: false,
      });

      channels = repo.getChannels();
      expect(channels[0].idle).toBe(false);
    });

    it("should preserve old messages when channel becomes active again", () => {
      const idleTimeoutMs = 60000;
      repo = new YoutubeChatRepository({ idleTimeoutMs });

      repo.initializeChannel("video123", "Channel One");

      // Add some messages
      const message1: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Hello",
        contentHtml: "<span>Hello</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      const message2: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg2",
        author: "User2",
        content: "World",
        contentHtml: "<span>World</span>",
        youtubeTimestamp: "0:05",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message1);
      repo.upsertChatMessage("video123", message2);

      // Fast-forward time past the idle timeout
      jest.advanceTimersByTime(idleTimeoutMs + 600);

      // Reactivate channel
      repo.handleHeartbeat({
        videoId: "video123",
        channelName: "Channel One",
        idle: false,
      });

      // Check that old messages are preserved
      const messages = repo.getChatMessages("video123");
      expect(messages).toHaveLength(2);
      expect(messages).toEqual([message1, message2]);
    });
  });

  describe("Chat message storage", () => {
    it("should save chat messages appropriately", () => {
      repo = new YoutubeChatRepository();
      repo.initializeChannel("video123", "Channel One");

      const message: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Test message",
        contentHtml: "<span>Test message</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message);

      const messages = repo.getChatMessages("video123");
      expect(messages).toHaveLength(1);
      expect(messages![0]).toEqual(message);
    });

    it("should trigger chat message callback when new message is added", () => {
      repo = new YoutubeChatRepository();
      const messageCallback = jest.fn();

      repo.subscribeChatMessage(messageCallback);
      repo.initializeChannel("video123", "Channel One");

      const message: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Test message",
        contentHtml: "<span>Test message</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message);

      expect(messageCallback).toHaveBeenCalledWith("video123", message);
    });

    it("should store multiple messages in order", () => {
      repo = new YoutubeChatRepository();
      repo.initializeChannel("video123", "Channel One");

      const message1: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "First",
        contentHtml: "<span>First</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      const message2: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg2",
        author: "User2",
        content: "Second",
        contentHtml: "<span>Second</span>",
        youtubeTimestamp: "0:05",
        timestamp: Date.now(),
      };

      const message3: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg3",
        author: "User3",
        content: "Third",
        contentHtml: "<span>Third</span>",
        youtubeTimestamp: "0:10",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message1);
      repo.upsertChatMessage("video123", message2);
      repo.upsertChatMessage("video123", message3);

      const messages = repo.getChatMessages("video123");
      expect(messages).toHaveLength(3);
      expect(messages![0].messageId).toBe("msg1");
      expect(messages![1].messageId).toBe("msg2");
      expect(messages![2].messageId).toBe("msg3");
    });
  });

  describe("Message deduplication and updates", () => {
    it("should not duplicate messages with the same ID", () => {
      repo = new YoutubeChatRepository();
      repo.initializeChannel("video123", "Channel One");

      const message: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Original content",
        contentHtml: "<span>Original content</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message);
      repo.upsertChatMessage("video123", message);

      const messages = repo.getChatMessages("video123");
      expect(messages).toHaveLength(1);
    });

    it("should update existing message when upserting with same ID", () => {
      repo = new YoutubeChatRepository();
      repo.initializeChannel("video123", "Channel One");

      const originalMessage: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Original content",
        contentHtml: "<span>Original content</span>",
        youtubeTimestamp: "0:00",
        timestamp: 1000,
      };

      repo.upsertChatMessage("video123", originalMessage);

      const updatedMessage: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Updated content",
        contentHtml: "<span>Updated content</span>",
        youtubeTimestamp: "0:00",
        timestamp: 2000,
      };

      repo.upsertChatMessage("video123", updatedMessage);

      const messages = repo.getChatMessages("video123");
      expect(messages).toHaveLength(1);
      expect(messages![0].content).toBe("Updated content");
      expect(messages![0].contentHtml).toBe("<span>Updated content</span>");
      expect(messages![0].timestamp).toBe(2000);
    });

    it("should not trigger chat message callback when updating existing message", () => {
      repo = new YoutubeChatRepository();
      const messageCallback = jest.fn();

      repo.subscribeChatMessage(messageCallback);
      repo.initializeChannel("video123", "Channel One");

      const message: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Original",
        contentHtml: "<span>Original</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      repo.upsertChatMessage("video123", message);

      // Clear the callback from the first upsert
      messageCallback.mockClear();

      // Upsert the same message ID
      const updatedMessage: YoutubeChatMessageData = {
        ...message,
        content: "Updated",
        contentHtml: "<span>Updated</span>",
      };

      repo.upsertChatMessage("video123", updatedMessage);

      // Callback should not be triggered for updates
      expect(messageCallback).not.toHaveBeenCalled();
    });

    it("should correctly report if a message exists", () => {
      repo = new YoutubeChatRepository();
      repo.initializeChannel("video123", "Channel One");

      const message: YoutubeChatMessageData = {
        videoId: "video123",
        messageId: "msg1",
        author: "User1",
        content: "Test",
        contentHtml: "<span>Test</span>",
        youtubeTimestamp: "0:00",
        timestamp: Date.now(),
      };

      expect(repo.hasMessage("video123", "msg1")).toBe(false);

      repo.upsertChatMessage("video123", message);

      expect(repo.hasMessage("video123", "msg1")).toBe(true);
      expect(repo.hasMessage("video123", "msg2")).toBe(false);
    });
  });
});
