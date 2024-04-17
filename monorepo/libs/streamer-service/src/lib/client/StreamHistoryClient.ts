import { getAuthHeaders } from "@hoagie/api-util";
import { StreamData } from "@hoagie/service-clients";
import axios from "axios";

const BASE_URL = "https://streamer.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://streamer-dev.hoagieman.net/api/v1/';

export interface StreamsResponse {
  streams: StreamData[]
}

export class StreamHistoryClient {
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

  async get(
    streamerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StreamsResponse> {
    const startDateParam = startDate ? `&startDate=${startDate.toISOString()}` : '';
    const endDateParam = endDate ? `&endDate=${endDate.toISOString()}` : '';
    const response = await axios.get(
      `${this.url}${streamerId}/streamhistory?${startDateParam}${endDateParam}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return {
      streams: response?.data
     } as StreamsResponse;
  }
}
