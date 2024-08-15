import { SubHandler } from "./EventHandlers/SubHandler";
import { TwitchNotificationEvent } from "./Events/ChannelChatNotificationEvent";

export class TwitchChatNotificationEventHandler {
  public async handle(ev: TwitchNotificationEvent): Promise<void> {
    console.log(ev);

    const subHandler = new SubHandler();

    switch (ev.notice_type) {
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
