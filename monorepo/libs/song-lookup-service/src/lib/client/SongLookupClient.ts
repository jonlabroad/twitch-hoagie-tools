import { getAuthHeaders } from "@hoagie/api-util";
import axios from "axios";

const BASE_URL = "https://songlookup.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://songlookup-dev.hoagieman.net/api/v1/';

export class SongLookupClient {
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

  async songLookup(
    artist: string,
    title: string,
    streamerId: string
  ) {
    const response = await axios.post(
      `${this.url}lookup?streamerid=${streamerId}`,
      {
        songs: [{
        songKey: `${artist} ${title}`,
        artist: artist,
        title: title
      }]},
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response?.data?.[0];
  }
}
