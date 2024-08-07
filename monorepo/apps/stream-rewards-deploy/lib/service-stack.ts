import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import * as logs from 'aws-cdk-lib/aws-logs';
import { ApiCloudFrontDistribution, ApiGatewayLambdaAuthorizer, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';
import * as awsEvents from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as aws_apigatewayv2_authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as events from 'aws-cdk-lib/aws-events';


const serviceName = 'StreamRewardService';
const appName = 'stream-rewards-app';
const subdomain = 'rewards';

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env');
    const context = this.node.tryGetContext(env);

    const lambdaExecutionRole = new BasicLambdaExecutionRoleConstruct(this, `${serviceName}-lambda-role`,
      [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'ecs:DescribeServices',
      ]).role;

    const twitchRewardRedemptionEventHandler = new lambda.Function(
      this,
      `twitchRewardRedemptionEventHandler`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.twitchRewardRedemptionEventHandler",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          TOKENTABLENAME: context.tokenTableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const twitchChatNotificationEventHandler = new lambda.Function(
      this,
      `twitchChatNotificationEventHandler`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.twitchChatNotificationEventHandler",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          TOKENTABLENAME: context.tokenTableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const twitchChatMessageEventHandler = new lambda.Function(
      this,
      `twitchChatMessageEventHandler`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.twitchChatMessageEventHandler",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          TOKENTABLENAME: context.tokenTableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const twitchChatNotificationRule = new events.Rule(this, 'twitchChatNotificationRule', {
      eventPattern: {
        source: ['hoagie.twitch-eventsub'],
        detailType: ['Event'],
        detail: {
          subscription: {
            type: ["channel.chat.notification"],
          },
        }
      },
    });
    twitchChatNotificationRule.addTarget(new targets.LambdaFunction(twitchChatNotificationEventHandler));

    const twitchRewardRedemptionRule = new events.Rule(this, 'twitchRewardRedemptionRule', {
      eventPattern: {
        source: ['hoagie.twitch-eventsub'],
        detailType: ['Event'],
        detail: {
          subscription: {
            type: ["channel.channel_points_custom_reward_redemption.add"],
          },
        }
      },
    });
    twitchRewardRedemptionRule.addTarget(new targets.LambdaFunction(twitchRewardRedemptionEventHandler));

    const twitchChatMessageRule = new events.Rule(this, 'twitchChatMessageRule', {
      eventPattern: {
        source: ['hoagie.twitch-eventsub'],
        detailType: ['Event'],
        detail: {
          subscription: {
            type: ["channel.chat.message"],
          },
        }
      },
    });
    twitchChatMessageRule.addTarget(new targets.LambdaFunction(twitchChatMessageEventHandler));
/*
    // HTTP API Gateway
    const httpApi = new HttpApi(this, `ConfigApi-${env}`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.DELETE],
        allowHeaders: ['*'],
      },
    });

    const authorizerConstruct = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/mods",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'mods-get-v1',
        getModsFunction,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    const distribution = new ApiCloudFrontDistribution(
      this,
      `distribution`,
      {
        subdomain: subdomain,
        env,
        httpApiId: httpApi.httpApiId,
      }
    );
*/
  }
}
