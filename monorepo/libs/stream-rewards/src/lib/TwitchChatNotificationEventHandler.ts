import { SubHandler } from "./EventHandlers/SubHandler";
import { TwitchChatNotificationEvent } from "./Events/ChannelChatNotificationEvent";

export class TwitchChatNotificationEventHandler {
  public async handle(ev: TwitchChatNotificationEvent): Promise<void> {
    console.log(ev);

    const subHandler = new SubHandler();

    switch (ev.Detail.event.notice_type) {
      case "sub":
        console.log("Sub Event");
        await subHandler.handle(ev);
        break;
      case "resub":
        await subHandler.handle(ev);
        console.log("Resub Event");
        break;
      case "sub_gift":
        console.log("Sub Gift Event");
        break;

    }

    return Promise.resolve();
  }
}
