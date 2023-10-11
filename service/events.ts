"use strict";

import { EventBridgeEvent } from "aws-lambda";
import TwitchClient from "./src/twitch/TwitchClient";
import StreamsDbClient from "./src/channelDb/StreamsDbClient";

module.exports.detectstreams = async (ev: EventBridgeEvent<any, any>) => {
  console.log(ev);

  const client = new TwitchClient();
  if (ev.detail.subscription.type === "stream.online") {
    const broadcasterId = ev.detail.subscription.condition.broadcaster_user_id;
    console.log({ broadcasterId });

    const liveStream = await client.getBroadcasterIdLiveStream(broadcasterId);
    console.log({ liveStream });

    if (liveStream) {
      const streamClient = new StreamsDbClient(broadcasterId);
      await streamClient.setStreamHistory(liveStream);
    }
  } else {
    console.log("Not a stream.online event");
  }
};
