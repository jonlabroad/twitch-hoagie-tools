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

    // Rewards API
    const getTokensFunction = new lambda.Function(
      this,
      `getTokensFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getTokens",
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

    // Rewards API
    const getRedemptionsFunction = new lambda.Function(
      this,
      `getRedemptionsFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getRedemptions",
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

    const getBroadcasterRedemptions = new lambda.Function(
      this,
      `getBroadcasterRedemptionsFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getBroadcasterRedemptions",
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

    const getStreamRewardConfig = new lambda.Function(
      this,
      `getStreamRewardConfigFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getStreamRewardsConfig",
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

    const writeStreamRewardConfig = new lambda.Function(
      this,
      `writeStreamRewardConfigFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.writeStreamRewardsConfig",
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

    // HTTP API Gateway
    const httpApi = new HttpApi(this, `ConfigApi-${env}`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.POST],
        allowHeaders: ['*'],
      },
    });

    const authorizerConstruct = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
      handler: "handlers.authorizer",
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/tokens",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'tokens-get-v1',
        getTokensFunction,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/redemptions",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'redemptions-get-v1',
        getRedemptionsFunction,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/broadcasterredemptions",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'broadcaster-redemptions-get-v1',
        getBroadcasterRedemptions,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/config",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'config-get-v1',
        getStreamRewardConfig,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/config",
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'config-write-v1',
        writeStreamRewardConfig,
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
  }
}
