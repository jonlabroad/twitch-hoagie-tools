import { getAuthHeaders } from "@hoagie/api-util";
import { StreamData } from "@hoagie/service-clients";
import axios from "axios";
import { StreamerConfigData } from "./StreamerConfigDBClient";
import { TwitchPlusStatusEntry } from "../plusTracker/TwitchPlusStatusDBClient";

const BASE_URL = "https://streamer.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://streamer-dev.hoagieman.net/api/v1/';

export class TwitchPlusStatusClient {
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

  async query(
    streamerId: string,
  ): Promise<TwitchPlusStatusEntry[]> {
    const response = await axios.get<TwitchPlusStatusEntry[]>(
      `${this.url}${streamerId}/twitchplus`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return (response?.data ?? []) as TwitchPlusStatusEntry[];
  }
}
