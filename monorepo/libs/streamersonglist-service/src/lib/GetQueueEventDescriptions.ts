import { TwitchClient } from "@hoagie/service-clients";
import { SSLEventDBClient } from "./SSLEventDBClient";
import { corsHeaders, createCacheHeader } from "@hoagie/api-util";
import { SSLEventDescriptionGenerator } from "./SSLEventDescriptionGenerator";

export interface GetQueueEventDescriptionsConfig {
  tableName: string,
  twitchClient: TwitchClient
}

export interface GetQueueEventDescriptionsRequest {
  userId?: string
  userLogin?: string
  startDate: Date
  endDate: Date
}

export class GetQueueEventDescriptions {
  config: GetQueueEventDescriptionsConfig

  constructor(config: GetQueueEventDescriptionsConfig) {
    this.config = config;
  }

  public async getEventDescriptions(request: GetQueueEventDescriptionsRequest) {
    console.log(request);
    let userId: string = request.userId ?? "";
    if (!userId) {
      const twitchClient = this.config.twitchClient;
      userId = await twitchClient.getUserId(request.userLogin!) ?? "";
    }

    console.time("getSSLEvents");
    const dbReader = new SSLEventDBClient(this.config.tableName);
    const items = await dbReader.get(userId, request.startDate.getTime(), request.endDate.getTime());
    const generator = new SSLEventDescriptionGenerator(this.config.twitchClient);
    console.timeEnd("getSSLEvents");

    console.time("generateSSLEventDescription");
    const descriptions = (await Promise.all((items ?? []).map(item => generator.generateSSLEventDescription(item)))).filter(d => !!d);
    console.timeEnd("generateSSLEventDescription");

    return {
      statusCode: 200,
      body: JSON.stringify(descriptions),
      headers: {
        ...corsHeaders,
        ...createCacheHeader(5),
      }
    }
  }
}
