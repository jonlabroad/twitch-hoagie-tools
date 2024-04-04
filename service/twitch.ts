"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";
import { VerificationRequest } from "./src/twitch/VerificationRequest";
import hmacSHA256 from "crypto-js/hmac-sha256";
import CryptoJS from "crypto-js";
import Config from "./src/Config";
import ListSubscriptions from "./src/twitch/ListSubscriptions";
import CreateSubscriptions from "./src/twitch/CreateSubscriptions";
import DeleteSubscription from "./src/twitch/DeleteSubscription";
import TwitchEventhandler from "./src/eventsub/TwitchEventHandler";
import TwitchWebhookEvent from "./src/twitch/TwitchWebhook";
import RaidProvider from "./src/twitch/RaidProvider";
import TwitchProvider from "./src/twitch/TwitchProvider";
import * as tmi from "tmi.js";
import ModsDbClient from "./src/channelDb/ModsDbClient";
import ConfigProvider from "./src/config/ConfigProvider";
import { BasicAuth } from "./src/util/BasicAuth";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import AdminDbClient from "./src/channelDb/AdminDbClient";
import { EventPublisher } from "./src/eventbus/EventPublisher";
import StreamsDbClient from "./src/channelDb/StreamsDbClient";
import TwitchClient from "./src/twitch/TwitchClient";
import CreateSelfSubscriptions from "./src/twitch/CreateSelfSubscriptions";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": true,
};

export const noCacheHeaders = {
  "Cache-Control": "no-cache",
};

const followCacheHeaders = {
  "Cache-Control": "max-age=5",
};

const donoDataHeaders = {
  "Cache-Control": "max-age=1",
}

const handler = new TwitchEventhandler();

module.exports.twitchwebhook = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event, null, 2));
  const verified = verifySignature(event);
  if (!verified) {
    return {
      statusCode: 401,
      headers: corsHeaders,
    };
  }

  const verificationResponse = handleVerificationRequest(event);
  if (verificationResponse) {
    console.log("Verification Request Handled");
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: verificationResponse,
    };
  }

  const adminClient = new AdminDbClient()
  const adminConfig = await adminClient.read()
  if (!adminConfig) {
    throw new Error("Unable to read admin configuration")
  }

  const body = JSON.parse(event.body ?? "{}") as TwitchWebhookEvent<any>;
  await handler.handle(body);
  try {
    const eventPublisher = new EventPublisher();
    await eventPublisher.send(body);
  } catch (err) {
    console.error(err);
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: "thx",
  };
};

function handleVerificationRequest(event: APIGatewayProxyEvent) {
  const msgType = event.headers["Twitch-Eventsub-Message-Type"];
  let response: string | undefined = undefined;
  if (msgType === "webhook_callback_verification") {
    const request = JSON.parse(event.body ?? "{}") as VerificationRequest;
    return request.challenge;
  }
  return response;
}

function verifySignature(event: APIGatewayProxyEvent) {
  const id = event.headers["Twitch-Eventsub-Message-Id"] ?? event.headers["Twitch-Eventsub-Message-Id".toLowerCase()] ?? "";
  const timestamp = event.headers["Twitch-Eventsub-Message-Timestamp"] ?? event.headers["Twitch-Eventsub-Message-Timestamp".toLowerCase()] ?? "";
  const msgSignature = event.headers["Twitch-Eventsub-Message-Signature"] ?? event.headers["Twitch-Eventsub-Message-Signature".toLowerCase()] ?? "";
  const body = event.body;
  if (!msgSignature) {
    return false;
  }

  const hmacMessage = id + timestamp + body;
  const expectedSignatureRaw = hmacSHA256(
    hmacMessage,
    process.env.SUBSCRIPTION_SECRET ?? ""
  );
  const expectedSignature = `sha256=${expectedSignatureRaw.toString(
    CryptoJS.enc.Hex
  )}`;
  if (msgSignature !== expectedSignature) {
    console.error("Invalid Signature!");
    return false;
  }

  return true;
}

module.exports.listsubscriptions = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(
      username,
      streamerName
    );
    if (authenticationResponse) {
      return authenticationResponse;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(await ListSubscriptions.list(), null, 2),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
      body: `${err.message}`,
    };
  }
};

module.exports.createsubscriptions = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    console.log(`Creating subscriptions for ${streamerLogin}`);
    return {
      statusCode: 200,
      body: JSON.stringify(
        await CreateSubscriptions.create(streamerLogin),
        null,
        2
      ),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `${err.message}`,
    };
  }
};

module.exports.createselfsubscriptions = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    console.log(`Creating subscriptions for ${streamerLogin}`);
    return {
      statusCode: 200,
      body: JSON.stringify(
        await CreateSelfSubscriptions.create(streamerLogin),
        null,
        2
      ),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `${err.message}`,
    };
  }
};

module.exports.deletesubscription = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const id = event.queryStringParameters?.["id"] ?? "";
    return {
      statusCode: 200,
      body: JSON.stringify(await DeleteSubscription.delete(id), null, 2),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `${err.message}`,
    };
  }
};

module.exports.getraiddata = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          raids: await RaidProvider.get(streamerLogin),
        },
        null,
        2
      ),
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `${err.message}`,
    };
  }
};

module.exports.streamhistoryV2 = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");

    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const auth = await ModRequestAuthorizer.auth(username, streamerName);
    if (auth) {
      return auth;
    }

    const broadcasterId = await (new TwitchClient()).getUserId(streamerLogin);
    if (!broadcasterId) {
      throw new Error(`Unable to find broadcaster id for ${streamerLogin}`)
    }
    const client = new StreamsDbClient(broadcasterId);
    const streams = await client.getStreamHistory();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          streamerLogin,
          streams: streams,
        },
        null,
        2
      ),
      headers: {
        ...corsHeaders,
        ...followCacheHeaders,
      },
    };
  } catch (err) {
    console.error(err.message, err);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
      },
      body: `${err.message}`,
    };
  }
};

module.exports.refreshmods = async (event: any) => {
  try {
    Config.validate();

    const blacklist = [
      "songlistbot",
      "streamelements",
      "nightbot",
      "streamlabs",
      "serybot",
    ];

    const config = await ConfigProvider.get();
    const channels = Array.from(config?.streamers.values ?? []);
    const client = new tmi.Client({
      channels,
      identity: {
        username: config?.chatUsername,
        password: config?.chatToken,
      },
    });

    let done = channels.map((c) => false);

    client.connect();
    client.on("connected", async (address, port) => {
      const allData = await Promise.all(
        channels.map(async (rawChannel) => {
          const mods = await client.mods(rawChannel);
          const channel = rawChannel.replace("#", "");
          console.log(JSON.stringify({ channel, mods }, null, 2));
          return { channel, mods };
        })
      );
      await Promise.all(
        allData.map(async (data, i) => {
          const client = new ModsDbClient(data.channel);
          const filtered = data.mods.filter(
            (mod) => !blacklist.includes(mod.toLowerCase())
          );
          await client.writeMods([
            ...filtered,
            data.channel.replace("#", "").toLowerCase(),
          ]);
          done[i] = true;
        })
      );
    });

    console.log(done.findIndex((d) => !d) >= 0);
    while (done.findIndex((d) => !d) >= 0) {
      console.log("Sleeping...");
      await sleep(1000);
    }
  } catch (err) {
    console.error(err);
    return `${err.message}`;
  }
};

module.exports.getmods = async (event: any) => {
  Config.validate();

  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
  if (!streamerName) {
    throw new Error("streamername not defined");
  }
  const client = new ModsDbClient(streamerName);
  const mods = await client.readMods();
  return {
    statusCode: 200,
    body: JSON.stringify(mods, null, 2),
    headers: {
      ...corsHeaders,
      ...followCacheHeaders,
    },
  };
};

module.exports.addmod = async (event: any) => {
  Config.validate();

  const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
  const auth = await ModRequestAuthorizer.auth(username, streamerName);
  if (auth) {
    return auth;
  }

  const modUsername = event.queryStringParameters?.["username"] ?? "";
  if (!streamerName) {
    throw new Error("streamername not defined");
  }

  if (!username) {
    throw new Error("username not defined");
  }

  const client = new ModsDbClient(streamerName);
  await client.addMod(modUsername);
  return {
    statusCode: 200,
    body: "OK",
    headers: {
      ...corsHeaders,
    },
  };
};

module.exports.removemod = async (event: any) => {
  Config.validate();

  const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
  const auth = await ModRequestAuthorizer.auth(username, streamerName);
  if (auth) {
    return auth;
  }

  const modUsername = event.queryStringParameters?.["username"] ?? "";
  if (!streamerName) {
    throw new Error("streamername not defined");
  }

  if (!username) {
    throw new Error("username not defined");
  }

  const client = new ModsDbClient(streamerName);
  const mods = await client.readMods();
  if (mods) {
    const index = mods?.mods.findIndex(
      (m) => m.toLowerCase() === modUsername.toLowerCase()
    );
    console.log({modUsername, index})
    if (index >= 0) {
      await client.deleteMod(modUsername, index);
    }
  }

  return {
    statusCode: 200,
    body: "OK",
    headers: {
      ...corsHeaders,
    },
  };
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
