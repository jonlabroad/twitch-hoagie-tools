"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";
import BadWordsClient from "./src/badwords/BadWordsClient";
import HoagieBadWordsClient from "./src/badwords/HoagieBadWordsClient";
import EvalDbClient from "./src/channelDb/EvalDbClient";
import Config from "./src/Config";
import GeniusClient from "./src/genius/GeniusClient";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import { BasicAuth } from "./src/util/BasicAuth";
import { noCacheHeaders } from "./twitch-dono";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": true,
};

export const cacheHeaders = {
  "Cache-Control": "max-age=14400",
};

module.exports.eval = async (event: APIGatewayProxyEvent) => {
  Config.validate(["TABLENAME"]);

  const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    event
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }
  let body: any = "err";
  try {
    const query = event.queryStringParameters?.["query"] ?? "";
    const geniusClient = new GeniusClient(Config.GeniusClientSecret);
    const geniusSong = await geniusClient.getSong(query);
    const lyrics = geniusSong
      ? await geniusClient.getLyricsFromUrl(geniusSong.url)
      : "";

    //Evaluate the lyrics
    let lyricsEval: any = undefined;
    if (lyrics) {
      const badWordsClient = new BadWordsClient(Config.BadWordsSecret);
      lyricsEval = await badWordsClient.eval(geniusSong.full_title, lyrics);
      if (lyricsEval.status.isError) {
        try {
          // Use the backup
          console.log("Using bad woards backup!");
          const hoagieClient = new HoagieBadWordsClient();
          const result = hoagieClient.eval(lyrics);
          console.log({ result });
          lyricsEval = result;
        } catch (err) {
          console.error(err);
        }
      }
    }

    body = {
      song: geniusSong,
      lyrics,
      lyricsEval,
    };
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
      ...cacheHeaders,
    },
    body: JSON.stringify(body),
  };
};

module.exports.readconfig = async (event: APIGatewayProxyEvent) => {
  Config.validate(["TABLENAME"]);

  const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
  const authenticationResponse = await ModRequestAuthorizer.auth(
    username,
    event
  );
  if (authenticationResponse) {
    return authenticationResponse;
  }

  let config: any = "err";
  try {
    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    const client = new EvalDbClient();
    config = await client.read(streamerLogin);
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
    const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
    console.log({ word, remove });
    if (word) {
      const client = new EvalDbClient();
      console.log({ streamerLogin, word });
      if (!remove || remove?.toLowerCase() !== "true") {
        await client.addWhitelistWord(streamerLogin, word);
      } else {
        await client.removeWhitelistWord(streamerLogin, word);
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
