import { TwitchClient } from "@hoagie/service-clients";
import { SSLEventDBClient } from "./SSLEventDBClient";
import { corsHeaders, createCacheHeader } from "@hoagie/api-util";

export interface GetQueueEventsConfig {
  tableName: string,
  twitchClient: TwitchClient
}

export interface GetQueueEventsRequest {
  userId?: string
  userLogin?: string
  startDate: Date
  endDate: Date
}

export class GetQueueEvents {
  config: GetQueueEventsConfig

  constructor(config: GetQueueEventsConfig) {
    this.config = config;
  }

  public async getEvents(request: GetQueueEventsRequest) {
    console.log(request);
    let userId: string = request.userId ?? "";
    if (!userId) {
      const twitchClient = this.config.twitchClient;
      userId = await twitchClient.getUserId(request.userLogin!) ?? "";
    }
    const dbReader = new SSLEventDBClient(this.config.tableName);
    const items = await dbReader.get(userId, request.startDate.getTime(), request.endDate.getTime());
    console.log({ items });

    return {
      statusCode: 200,
      body: JSON.stringify(items),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(5),
      }
    }
  }
}
