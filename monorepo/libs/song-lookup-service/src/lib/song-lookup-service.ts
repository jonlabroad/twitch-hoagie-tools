import { DBResponseCache, corsHeaders } from "@hoagie/api-util";
import { APIGatewayEvent } from "aws-lambda";
import SpotifyGetSongs from "./SpotifyGetSongs";

const getCacheHeaders = (maxAgeSec: number) => {
  return {
    "Cache-Control": `max-age=${maxAgeSec}`
  };
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
  version: string;
}

export async function songLookupService(config: SongLookupConfig, event: APIGatewayEvent) {
  try {
      const request = JSON.parse(event.body ?? "{}") as GetSongsRequestBody;
      console.log({ request });

      const createPlaylist = new SpotifyGetSongs(config.clientId, config.clientSecret, config.tableName);
      const songInfos = await createPlaylist.getSongs(request.songs ?? [], config.version);

      return {
          statusCode: 200,
          headers: {
              ...corsHeaders,
              ...getCacheHeaders(60 * 60),
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
