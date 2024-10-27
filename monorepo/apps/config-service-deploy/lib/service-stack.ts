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

const serviceName = 'ConfigService';
const appName = 'config-service-app';
const subdomain = 'config';

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

    const configUpdateFunction = new lambda.Function(
      this,
      `PeriodicConfigUpdate`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.periodicConfigUpdate",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
        memorySize: 1024,
      }
    );
    const scheduleRule = new awsEvents.Rule(this, 'ScheduleRule', {
      enabled: true,
      schedule: awsEvents.Schedule.expression('rate(30 minutes)'),
    });
    scheduleRule.addTarget(new targets.LambdaFunction(configUpdateFunction));

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${configUpdateFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });

    // Mods
    const getModsFunction = new lambda.Function(
      this,
      `GetMods`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getmods",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const addModFunction = new lambda.Function(
      this,
      `AddMod`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.addmod",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const removeModFunction = new lambda.Function(
      this,
      `RemoveMod`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.removemod",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const getUserDataFunction = new lambda.Function(
      this,
      `GetUserData`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getUserData",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const systemStatusFunction = new lambda.Function(
      this,
      `SystemStatus`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.systemStatus",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const setAccessTokenCallbackFunction = new lambda.Function(
      this,
      `SetAccessTokenCallback`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.setAccessTokenCallback",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    // Twitch subscriptions
    const twitchEventSubGetFunction = new lambda.Function(
      this,
      `TwitchEventSubGet`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getSubscriptions",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const twitchEventSubSubscribeFunction = new lambda.Function(
      this,
      `TwitchEventSubSubscribe`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.createSubscriptions",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(60),
        memorySize: 1024,
      }
    );

    const twitchEventSubDeleteFunction = new lambda.Function(
      this,
      `TwitchEventSubDelete`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.deleteSubscription",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(60),
        memorySize: 1024,
      }
    );

    const twitchAuthTokenValidationFunction = new lambda.Function(
      this,
      `TwitchAuthTokenValidation`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.twitchAuthTokenValidation",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
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
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.POST, CorsHttpMethod.DELETE],
        allowHeaders: ['*'],
      },
    });

    const authorizerConstruct = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
    });

    const adminAuthorizerConstruct = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-admin-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
      handler: 'handlers.adminOnlyAuthorizer',
      suffix: "-admin",
    });

    const authenticateOnlyAuthorizer = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-authenticate-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
      handler: 'handlers.authenticateOnlyAuthorizer',
      suffix: "-authenticateonly",
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

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/mods/{modId}",
      methods: [HttpMethod.PUT],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'mods-add-v1',
        addModFunction,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/mods/{modId}",
      methods: [HttpMethod.DELETE],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'mods-delete-v1',
        removeModFunction,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/userdata",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'userdata-get-v1',
        getUserDataFunction,
      ),
      authorizer: authenticateOnlyAuthorizer.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/system/status",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'systemstatus-get-v1',
        systemStatusFunction,
      ),
      authorizer: authenticateOnlyAuthorizer.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/access/twitchtoken/{category}",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitchtoken-get-v1',
        setAccessTokenCallbackFunction,
      ),
    });

    httpApi.addRoutes({
      path: "/api/v1/twitch/subscriptions",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitch-subscriptions-get-v1',
        twitchEventSubGetFunction,
      ),
      authorizer: adminAuthorizerConstruct.authorizer,
    })

    httpApi.addRoutes({
      path: "/api/v1/twitch/subscriptions",
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitch-subscriptions-post-v1',
        twitchEventSubSubscribeFunction,
      ),
      authorizer: adminAuthorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/twitch/subscriptions/{subscriptionId}",
      methods: [HttpMethod.DELETE],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitch-subscriptions-delete-v1',
        twitchEventSubDeleteFunction,
      ),
      authorizer: adminAuthorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: "/api/v1/access/twitchtoken/validate",
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitchtoken-validate-v1',
        twitchAuthTokenValidationFunction,
      ),
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
