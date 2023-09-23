"use strict";

import { APIGatewayProxyEvent, EventBridgeEvent } from "aws-lambda";
import { EventDbClient } from "./src/eventbus/EventDbClient";
import TwitchClient from "./src/twitch/TwitchClient";
import StreamsDbClient from "./src/channelDb/StreamsDbClient";
import { ChatEventProcessor } from "./src/chateventprocessor/ChatEventProcessor";
import { getChannel } from "./src/chateventprocessor/Util";

module.exports.twitchchatsource = async (ev: EventBridgeEvent<any, any>) => {
  console.log(ev);
  try {
    const client = new TwitchClient();
    const stream = await client.getBroadcasterLoginLiveStream(ev.detail.channel.replace("#", ""));
    const broadcasterName = getChannel(ev.detail.channel);
    const broadcasterId = await client.getUserId(broadcasterName);
    if (stream && broadcasterId) {
        const writer = new EventDbClient();
        await writer.writeEvent(stream.id, broadcasterId, ev);
    } else {
        console.error(`Could not find stream or channel name for ${broadcasterName}: ${stream?.id}, ${broadcasterId}`);
    }
  } catch (err) {
    console.error(err);
  }

  console.log(`Processing ${ev["detail-type"]} event`);
  await ChatEventProcessor.process(ev);
};

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
