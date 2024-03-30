import { StreamerSongListClient, TwitchClient, UserData } from "@hoagie/service-clients";
import { SSLEvent } from "./SSLEventDBClient";
import { NewPlayHistoryEvent, SongListEventDescription, SongQueueEvent, SongQueueUpdateEvent, SongUpdateEvent } from "./client/StreamerSongListEventTypes";

export class SSLEventDescriptionGenerator {
  private streamerSongListClient: StreamerSongListClient;

  constructor() {
    this.streamerSongListClient = new StreamerSongListClient();
  }

  public async generateSSLEventDescription(event: SSLEvent, twitchUserInfos: Record<string, UserData>): Promise<SongListEventDescription | undefined> {
    switch (event["detail-type"]) {
      case "queue-event":
        return await this.generateUpdateSongDescription(event.detail.eventData as SongQueueEvent, event.time, twitchUserInfos);
      case "new-playhistory":
        return await this.generateNewPlayHistoryDescription(event.detail.eventData as NewPlayHistoryEvent);
      default:
        break;
    }
    return undefined;
  }

  private async generateNewPlayHistoryDescription(ev: NewPlayHistoryEvent): Promise<SongListEventDescription | undefined> {
    let songName = "";
    if (ev.songId) {
      const sslSong = await this.getSSLSong(ev.streamerId.toString(), ev.songId);
      if (sslSong) {
        songName = `${sslSong.title} - ${sslSong.artist}`;
      }
    } else {
      songName = ev.nonlistSong ??  "Unknown song";
    }

    return {
      timestamp: new Date(ev.playedAt).toISOString(),
      eventType: "new-playhistory",
      text: `${songName} has been played`,
    }
  }

  private async generateUpdateSongDescription(ev: SongQueueEvent, timestamp: string, twitchUserInfos: Record<string, UserData>): Promise<SongListEventDescription | undefined> {
    const isPositionChange = !!ev.oldPosition && ev.position !== ev.oldPosition;
    const userName = ev.by;
    let userData: UserData | undefined;

    const songName = ev.artist ? `${ev.title} - ${ev.artist}` : (ev.title ?? "Unknown song");
    if (userName) {
      userData = twitchUserInfos[userName.toLowerCase()];
    }

    if (isPositionChange) {
      return {
        timestamp,
        eventType: "queue-event",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} moved ${songName} from position ${ev.oldPosition} to ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    if (ev.added) {
      return {
        timestamp,
        eventType: "queue-event",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} added ${songName} to the queue at position ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    if (ev.deleted) {
      return {
        timestamp,
        eventType: "queue-event",
        text: `${userData?.display_name ?? userName ?? "Unknown user"} removed ${songName} from the queue at position ${ev.position}`,
        userName: userName,
        userInfo: userData,
      }
    }

    return undefined;
  }

  private async getSSLSong(streamerId: string, songId: string | number) {
    return await this.streamerSongListClient.getSong(streamerId, songId.toString());
  }
}

