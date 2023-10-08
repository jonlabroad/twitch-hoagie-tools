"use strict";

import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import TwitchLambdaAuthenticator from "./src/twitch/TwitchLambdaAuthenticator";

module.exports.twitch_authorizer = async (event: APIGatewayTokenAuthorizerEvent, context: any, callback: (p1: any, policy?: any) => any) => {
  try {
    const auth = await TwitchLambdaAuthenticator.auth(event);
    if (auth) {
      console.log(auth);
      callback("Unauthorized");
    }

    callback(null, {
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
    });
  } catch (err) {
    console.error(err.message, err);
    callback("Unauthorized (error)");
  }
};
