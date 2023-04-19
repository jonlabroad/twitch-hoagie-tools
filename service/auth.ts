"use strict";

import { APIGatewayProxyEvent, APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { AdminData } from "./src/channelDb/AdminDbClient";
import Config from "./src/Config";
import TwitchLambdaAuthenticator from "./src/twitch/TwitchLambdaAuthenticator";

module.exports.twitch_authorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const auth = await TwitchLambdaAuthenticator.auth(event);
    if (auth) {
      console.log(auth);
      throw new Error("Unauthorized");
    }

    const policy = {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };

    return policy;
  } catch (err) {
    console.error(err.message, err);
    throw new Error("Unauthorized");
  }
};
