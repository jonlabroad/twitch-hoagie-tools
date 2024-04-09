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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(
      userId,
      streamerId
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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    console.log(`Creating subscriptions for ${streamerId}`);
    return {
      statusCode: 200,
      body: JSON.stringify(
        await CreateSubscriptions.create(streamerId),
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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    console.log(`Creating subscriptions for ${streamerId}`);
    return {
      statusCode: 200,
      body: JSON.stringify(
        await CreateSelfSubscriptions.create(streamerId),
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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          raids: await RaidProvider.get(streamerId),
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

    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");

    const auth = await ModRequestAuthorizer.auth(userId, streamerId);
    if (auth) {
      return auth;
    }

    const client = new StreamsDbClient(streamerId);
    const streams = await client.getStreamHistory();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          streamerId,
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

module.exports.getmods = async (event: any) => {
  Config.validate();

  const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }
  const client = new ModsDbClient(Config.tableName, streamerId);
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

  const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
  const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
  const auth = await ModRequestAuthorizer.auth(userId, streamerId);
  if (auth) {
    return auth;
  }

  const modId = event.queryStringParameters?.["userid"] ?? "";
  if (!streamerId) {
    throw new Error("streamerId not defined");
  }

  if (!userId) {
    throw new Error("userId not defined");
  }

  const client = new ModsDbClient(Config.tableName, streamerId);
  await client.addMod(modId);
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

  const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
  const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
  const auth = await ModRequestAuthorizer.auth(userId, streamerId);
  if (auth) {
    return auth;
  }

  const modUsername = event.queryStringParameters?.["userid"] ?? "";
  if (!streamerId) {
    throw new Error("streamername not defined");
  }

  if (!userId) {
    throw new Error("username not defined");
  }

  const client = new ModsDbClient(Config.tableName, streamerId);
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
