import { TwitchClient, UserData } from "@hoagie/service-clients";
import { SSLEvent } from "./SSLEventDBClient";
import { SongListEventDescription, SongQueueEvent, SongQueueUpdateEvent, SongUpdateEvent } from "./client/StreamerSongListEventTypes";

export class SSLEventDescriptionGenerator {
  private twitchClient: TwitchClient | undefined;
  private userDataCache: Record<string, UserData> = {};

  constructor(twitchClient: TwitchClient | undefined) {
    this.twitchClient = twitchClient;
  }

  public async generateSSLEventDescription(event: SSLEvent): Promise<SongListEventDescription | undefined> {
    switch (event["detail-type"]) {
      case "queue-event":
        return await this.generateUpdateSongDescription(event.detail.eventData as SongQueueEvent, event.time);
      default:
        //return `Unknown event type ${event["detail-type"]}`;
    }
    return undefined;
  }

  private async generateUpdateSongDescription(ev: SongQueueEvent, timestamp: string): Promise<SongListEventDescription | undefined> {
    const isPositionChange = ev.position !== ev.oldPosition;
    const userName = ev.by;
    let userData: UserData | undefined;

    const songName = ev.artist ? `${ev.title} - ${ev.artist}` : (ev.title ?? "Unknown song");
    if (userName) {
      userData = this.userDataCache[userName.toLowerCase()];
      if (!userData && this.twitchClient) {
        userData = await this.twitchClient.getUserData(userName);
        if (userData) {
          this.userDataCache[userName.toLowerCase()] = userData;
        }
      }
    }

    if (isPositionChange) {
      return {
        timestamp,
        eventType: "queue-update",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} moved ${songName} from position ${ev.oldPosition} to ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    if (ev.added) {
      return {
        timestamp,
        eventType: "queue-update",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} added ${songName} to the queue at position ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    if (ev.deleted) {
      return {
        timestamp,
        eventType: "queue-update",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} removed ${songName} from the queue at position ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    return undefined;
  }
}

