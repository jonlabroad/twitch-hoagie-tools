import axios from "axios";
import { SongListEvent } from "./StreamerSongListEventTypes";

const BASE_URL = "https://streamersonglist.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://streamersonglist-dev.hoagieman.net/api/v1/';

export class StreamerSongListHoagieClient {
  environment: "prod" | "dev"
  url: string
  constructor(environment: "prod" | "dev" = "prod") {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  async getEvents(
    userId: string | undefined,
    userLogin: string | undefined,
    startDate: Date,
    endDate?: Date,
  ): Promise<SongListEvent> {
    const userIdOrLoginParam = userId ? `userId=${userId}` : `userLogin=${userLogin}`;
    const endDateRequest = endDate ? endDate.toISOString() : new Date().toISOString();
    const response = await axios.get(
      `${this.url}queueevents?${userIdOrLoginParam}&startDate=${startDate.toISOString()}&endDate=${endDateRequest}`,
      {
        //headers: getAuthHeaders(username, accessToken),
      }
    );
    return response?.data?.[0];
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
    return response?.data?.[0];
  }
}
