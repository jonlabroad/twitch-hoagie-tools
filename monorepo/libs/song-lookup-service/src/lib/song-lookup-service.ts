import { corsHeaders } from "@hoagie/api-util";
import { APIGatewayEvent } from "aws-lambda";
import SpotifyGetSongs from "./SpotifyGetSongs";

export const cacheHeaders = {
  "Cache-Control": "max-age=3600"
}

export interface GetSongsRequestBody {
  songs: {
      songKey: string
      artist: string
      title: string
  }[]
}

export interface SongLookupConfig {
  tableName: string;
  clientId: string;
  clientSecret: string;
}

export async function songLookupService(config: SongLookupConfig, event: APIGatewayEvent) {
  try {
      const request = JSON.parse(event.body ?? "{}") as GetSongsRequestBody;
      console.log({ request });

      const createPlaylist = new SpotifyGetSongs(config.clientId, config.clientSecret);
      const songInfos = await createPlaylist.getSongs(request.songs ?? []);

      return {
          statusCode: 200,
          headers: {
              ...corsHeaders,
          },
          body: JSON.stringify(songInfos)
      };
  } catch (err: any) {
      console.error(err);
      return {
          statusCode: 500,
          headers: corsHeaders,
          body: err.message,
      }
  }
}
