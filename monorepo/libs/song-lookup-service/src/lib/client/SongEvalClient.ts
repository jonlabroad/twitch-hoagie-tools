import { getAuthHeaders } from "@hoagie/api-util";
import axios from "axios";

const BASE_URL = "https://songeval.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://songeval-dev.hoagieman.net/api/v1/';

export class SongEvalClient {
  environment: "prod" | "dev"
  url: string
  constructor(environment: "prod" | "dev" = "prod") {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  async songEval(
    song: string,
    username: string,
    accessToken: string,
    streamerName: string
  ) {
    const response = await axios.get(
      `${this.url}eval?query=${song}&streamername=${streamerName}`,
      {
        headers: getAuthHeaders(username, accessToken),
      }
    );
    return response?.data;
  }
}
