import axios from "axios";
import { SongListEvent, SongListEventDescription } from "./StreamerSongListEventTypes";
import { SSLEventListItem } from "@hoagie/streamersonglist-service";

const BASE_URL = "https://streamersonglist.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://streamersonglist-dev.hoagieman.net/api/v1/';

export class StreamerSongListHoagieClient {
  environment: "prod" | "dev"
  url: string
  userId: string
  accessToken: string

  constructor(environment: "prod" | "dev" = "prod", userId: string, accessToken: string) {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
    this.userId = userId;
    this.accessToken = accessToken;
  }

  async getEvents(
    startDate: Date,
    endDate?: Date,
  ): Promise<SSLEventListItem[]> {
    const userIdOrLoginParam = `userId=${this.userId}`;
    const oneMinFromNow = new Date();
    oneMinFromNow.setMinutes(new Date().getMinutes() + 1);
    const endDateRequest = endDate ? endDate.toISOString() : oneMinFromNow.toISOString();
    const response = await axios.get(
      `${this.url}queueevents?${userIdOrLoginParam}&startDate=${startDate.toISOString()}&endDate=${endDateRequest}`,
      {
        //headers: getAuthHeaders(username, accessToken),
      }
    );
    return response?.data;
  }

  async getEventDescriptions(
    userId: string | undefined,
    userLogin: string | undefined,
    startDate: Date,
    endDate?: Date,
  ) {
    const userIdOrLoginParam = userId ? `userId=${userId}` : `userLogin=${userLogin}`;
    const endDateRequest = endDate ? endDate.toISOString() : new Date().toISOString();
    const response = await axios.get(
      `${this.url}queueeventdescriptions?${userIdOrLoginParam}&startDate=${startDate.toISOString()}&endDate=${endDateRequest}`,
      {
        //headers: getAuthHeaders(username, accessToken),
      }
    );
    return response?.data as SongListEventDescription[];
  }
}
