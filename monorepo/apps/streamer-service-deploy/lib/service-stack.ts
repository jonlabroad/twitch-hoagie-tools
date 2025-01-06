import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import {
  ApiCloudFrontDistribution,
  ApiGatewayLambdaAuthorizer,
  BasicLambdaExecutionRoleConstruct,
} from '@hoagie/cdk-lib';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as awsEvents from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.secrets' });
if (!process.env.PLUSPOINTS_CLIENT_ID) {
  throw new Error('PLUSPOINTS_CLIENT_ID must be set in .env.secrets');
}

const appName = 'streamer-service-app';
const subdomain = 'streamer';

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env');
    const context = this.node.tryGetContext(env);

    const lambdaExecutionRole = new BasicLambdaExecutionRoleConstruct(
      this,
      `lambda-role`,
      [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'ecs:DescribeServices',
        'sns:Publish',
      ]
    ).role;

    const getConfig = new lambda.Function(this, `GetConfig`, {
      code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
      handler: 'handlers.getConfig',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: context.tableName,
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    const setConfig = new lambda.Function(this, `SetConfig`, {
      code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
      handler: 'handlers.setConfig',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: context.tableName,
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    const getStreamHistory = new lambda.Function(this, `GetStreamHistory`, {
      code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
      handler: 'handlers.getStreamHistory',
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLENAME: context.tableName,
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    const pollTwitchPlusStatusFunction = new lambda.Function(
      this,
      `PollTwitchPlusStatus`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: 'handlers.pollTwitchPlusStatuses',
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          TABLENAME: context.tableName,
          PLUSPOINTS_CLIENT_ID:
            process.env.PLUSPOINTS_CLIENT_ID ?? 'NO_CLIENT_ID',
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const queryTwitchPlusStatusFunction = new lambda.Function(
      this,
      `QueryTwitchPlusData`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: 'handlers.queryTwitchPlusData',
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(60),
        memorySize: 1024,
      }
    );

    // Trigger pollTwitchPlusStatus every 5 minutes
    const twitchPlusPollRule = new awsEvents.Rule(this, 'twitchPlusPollRule', {
      enabled: true,
      schedule: awsEvents.Schedule.expression('rate(15 minutes)'),
    });
    twitchPlusPollRule.addTarget(
      new targets.LambdaFunction(pollTwitchPlusStatusFunction)
    );

    // HTTP API Gateway
    const httpApi = new HttpApi(this, `StreamerApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowHeaders: ['*'],
      },
    });

    const authorizerConstruct = new ApiGatewayLambdaAuthorizer(
      this,
      `${appName}-authorizer`,
      {
        appName,
        tableName: context.tableName,
        lambdaExecutionRole,
      }
    );

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/config',
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'config-get-v1',
        getConfig
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/config',
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'config-set-v1',
        setConfig
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/twitchplus',
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'twitchplus-get-v1',
        queryTwitchPlusStatusFunction
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/streamhistory',
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'streamhistory-get-v1',
        getStreamHistory
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    const distribution = new ApiCloudFrontDistribution(this, `distribution`, {
      subdomain: subdomain,
      env,
      httpApiId: httpApi.httpApiId,
    });
  }
}
