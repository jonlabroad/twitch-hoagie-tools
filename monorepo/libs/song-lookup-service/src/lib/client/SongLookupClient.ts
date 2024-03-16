import { getAuthHeaders } from "@hoagie/api-util";
import axios from "axios";

const BASE_URL = "https://songlookup.hoagieman.net/api/v1/"
const BASE_URL_DEV = 'https://songlookup-dev.hoagieman.net/api/v1/';

export class SongLookupClient {
  environment: "prod" | "dev"
  url: string
  constructor(environment: "prod" | "dev" = "prod") {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  async songLookup(
    artist: string,
    title: string,
    username: string,
    accessToken: string,
    streamerName: string
  ) {
    const response = await axios.post(
      `${this.url}lookup?streamername=${streamerName}`,
      {
        songs: [{
        songKey: `${artist} ${title}`,
        artist: artist,
        title: title
      }]},
      {
        headers: getAuthHeaders(username, accessToken),
      }
    );
    return response?.data?.[0];
  }
}
