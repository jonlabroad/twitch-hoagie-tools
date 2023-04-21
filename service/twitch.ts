"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";
import { VerificationRequest } from "./src/twitch/VerificationRequest";
import hmacSHA256 from "crypto-js/hmac-sha256";
import CryptoJS from "crypto-js";
import Config from "./src/Config";
import ListSubscriptions from "./src/twitch/ListSubscriptions";
import CreateSubscriptions from "./src/twitch/CreateSubscriptions";
import TwitchRequestAuthenticator from "./src/twitch/TwitchRequestAuthenticator";
import DeleteSubscription from "./src/twitch/DeleteSubscription";
import TwitchEventhandler from "./src/eventsub/TwitchEventHandler";
import { TheSongeryHandlers } from "./src/eventsub/TheSongeryHandlers";
import { TestHandlers } from "./src/eventsub/TestHandlers";
import TwitchWebhookEvent from "./src/twitch/TwitchWebhook";
import RaidProvider from "./src/twitch/RaidProvider";
import TwitchProvider from "./src/twitch/TwitchProvider";
import DonoProvider from "./src/twitch/DonoProvider";
import * as tmi from "tmi.js";
import ModsDbClient from "./src/channelDb/ModsDbClient";
import ModAuthorizer from "./src/twitch/ModAuthorizer";
import ConfigProvider from "./src/config/ConfigProvider";
import DonoDbClient from "./src/channelDb/DonoDbClient";
import { BasicAuth } from "./src/util/BasicAuth";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";

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

const handlers = new TwitchEventhandler([TheSongeryHandlers, TestHandlers]);

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

  const body = JSON.parse(event.body ?? "{}") as TwitchWebhookEvent<any>;
  await handlers.handle(body);

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
  const id = event.headers["Twitch-Eventsub-Message-Id"] ?? "";
  const timestamp = event.headers["Twitch-Eventsub-Message-Timestamp"] ?? "";
  const msgSignature = event.headers["Twitch-Eventsub-Message-Signature"] ?? "";
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
    const authenticationResponse = await ModRequestAuthorizer.auth(
      username,
      event
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

    const authResponse = await TwitchRequestAuthenticator.auth(event);
    if (authResponse) {
      return authResponse;
    }

    const authenticationResponse = await ModAuthorizer.auth(event);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const streamerLogin = event.queryStringParameters?.["channelname"] ?? "";
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

module.exports.deletesubscription = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const authenticationResponse = await ModRequestAuthorizer.auth(
      username,
      event
    );
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

    const authResponse = await TwitchRequestAuthenticator.auth(event);
    if (authResponse) {
      console.log(`Unauthorized: ${authResponse.statusCode}`);
      return authResponse;
    }

    const authenticationResponse = await ModAuthorizer.auth(event);
    if (authenticationResponse) {
      return authenticationResponse;
    }

    const streamerLogin = event.queryStringParameters?.["streamerLogin"] ?? "";

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

module.exports.getuserinfo = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    const userLogin = event.queryStringParameters?.["username"] ?? "";

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          userLogin,
          streamerLogin,
          ...(await TwitchProvider.getUserData(streamerLogin, userLogin)),
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

module.exports.donodata = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    const userLogin = event.queryStringParameters?.["username"] ?? "";
    const streamIds = event.multiValueQueryStringParameters?.["streamId"];

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
    const auth = await ModRequestAuthorizer.auth(username, event);
    if (auth) {
      return auth;
    }

    const donos = await DonoProvider.get(streamerLogin, streamIds);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          userLogin,
          streamerLogin,
          ...donos,
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

module.exports.streamhistory = async (event: APIGatewayProxyEvent) => {
  try {
    Config.validate();

    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    const userLogin = event.queryStringParameters?.["username"] ?? "";
    const { username } = BasicAuth.decode(event.headers.Authorization ?? "");

    const auth = await ModRequestAuthorizer.auth(username, event);
    if (auth) {
      return auth;
    }

    const client = new DonoDbClient(streamerLogin);
    const streams = await client.getStreamHistory();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          userLogin,
          streamerLogin,
          ...streams,
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
  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    event
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
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
  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    event
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  const streamerName = event.queryStringParameters?.["streamername"] ?? "";
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
