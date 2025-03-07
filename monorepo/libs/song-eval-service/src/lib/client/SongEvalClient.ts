import { getAuthHeaders } from "@hoagie/api-util";
import axios from "axios";
import { SongEvalConfigData } from "./SongEvalDBClient";

const BASE_URL = "https://songeval.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://songeval-dev.hoagieman.net/api/v1/';

export interface EvalResponse {
  lyrics: string;
  lyricsEval: any;
  song: {
    artist: {
      name: string;
    };
    title: string;
  };
}

export class SongEvalClient {
  environment: "prod" | "dev"
  url: string
  userId: string
  accessToken: string

  constructor(environment: "prod" | "dev" = "prod", userId: string, accessToken: string) {
    this.environment = environment;
    this.userId = userId;
    this.accessToken = accessToken;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  async songEval(
    song: string,
    streamerId: string
  ): Promise<EvalResponse | null> {
    const response = await axios.get(
      `${this.url}eval?query=${song}&streamerid=${streamerId}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data;
  }

  async getConfig(
    streamerId: string
  ) {
    const response = await axios.get(
      `${this.url}${streamerId}/config`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data as SongEvalConfigData;
  }

  async addAllowListWord(
    streamerId: string,
    word: string,
  ) {
    const response = await axios.put(
      `${this.url}${streamerId}/allowlist?word=${word}`,
      {},
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data;
  }

  async removeAllowListWord(
    streamerId: string,
    word: string,
  ) {
    const response = await axios.delete(
      `${this.url}${streamerId}/allowlist?word=${word}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data;
  }
}
