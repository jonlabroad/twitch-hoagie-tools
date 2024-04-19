import axios from "axios";
import { SongListEvent, SongListEventDescription } from "./StreamerSongListEventTypes";
import { SSLEventListItem } from "@hoagie/streamersonglist-service";
import { getAuthHeaders } from "@hoagie/api-util";

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
    streamerId: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<SSLEventListItem[]> {
    const oneMinFromNow = new Date();
    oneMinFromNow.setMinutes(new Date().getMinutes() + 1);
    const endDateRequest = endDate ? endDate.toISOString() : oneMinFromNow.toISOString();
    const response = await axios.get(
      `${this.url}${streamerId}/queueevents?startDate=${startDate.toISOString()}&endDate=${endDateRequest}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data;
  }
}
