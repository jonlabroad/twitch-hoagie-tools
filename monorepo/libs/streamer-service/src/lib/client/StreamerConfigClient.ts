import { getAuthHeaders } from "@hoagie/api-util";
import { StreamData } from "@hoagie/service-clients";
import axios from "axios";
import { StreamerConfigData } from "./StreamerConfigDBClient";

const BASE_URL = "https://streamer.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://streamer-dev.hoagieman.net/api/v1/';

export class StreamerConfigClient {
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
  ): Promise<StreamerConfigData | null> {
    const response = await axios.get<StreamerConfigData | null>(
      `${this.url}${streamerId}/config`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return (response?.data ?? null) as StreamerConfigData | null;
  }

  async set(
    streamerId: string,
    config: StreamerConfigData,
  ): Promise<void> {
    const response = await axios.post(
      `${this.url}${streamerId}/config`,
      config,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
  }
}
