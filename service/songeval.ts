"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";
import EvalDbClient from "./src/channelDb/EvalDbClient";
import Config from "./src/Config";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import { BasicAuth } from "./src/util/BasicAuth";
import { noCacheHeaders } from "./admin";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": true,
};

export const cacheHeaders = {
  "Cache-Control": "max-age=14400",
};

module.exports.readconfig = async (event: APIGatewayProxyEvent) => {
  Config.validate(["TABLENAME"]);

  const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");
  const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
  const authenticationResponse = await ModRequestAuthorizer.auth(
    userId,
    streamerId
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  let config: any = "err";
  try {
    const client = new EvalDbClient();
    config = await client.read(streamerId);
    console.log({ config });
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        ...noCacheHeaders,
      },
      body: JSON.stringify(config),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }
};

module.exports.addwhitelistword = async (event: APIGatewayProxyEvent) => {
  Config.validate(["TABLENAME"]);
  //    const auth = await ModAuthorizer.auth(event);
  //    if (auth) {
  //        return auth;
  //    }

  let body: any = "err";
  try {
    const word = event.queryStringParameters?.["word"] ?? "";
    const remove = event.queryStringParameters?.["remove"];
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    console.log({ word, remove });
    if (word) {
      const client = new EvalDbClient();
      console.log({ streamerId, word });
      if (!remove || remove?.toLowerCase() !== "true") {
        await client.addWhitelistWord(streamerId, word);
      } else {
        await client.removeWhitelistWord(streamerId, word);
      }
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: err.message,
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      ...noCacheHeaders,
    },
    body: "OK",
  };
};
