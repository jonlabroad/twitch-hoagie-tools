import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventtargets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs/lib/construct';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ApiCloudFrontDistribution, ApiGatewayLambdaAuthorizer, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';

const serviceName = 'StreamerSongList';
const appName = 'streamersonglist-service-app';
const writeEventHandler = 'handlers.writeEvent';
const getEventsHandler = 'handlers.getEvents';
const route = '/api/v1/{streamerId}/queueevents';
const subdomain = 'streamersonglist';

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
      ]).role;

    const writeEventsFunction = new lambda.Function(
      this,
      `${serviceName}-writeevent-function`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: writeEventHandler,
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

    const getEventsFunction = new lambda.Function(
      this,
      `getevents-function`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: getEventsHandler,
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

    const eventBridgeRule = new events.Rule(this, `${serviceName}-eventBridgeRule`, {
      eventPattern: {
        source: ['hoagie.streamersonglist'],
      },
    });
    eventBridgeRule.addTarget(new eventtargets.LambdaFunction(writeEventsFunction));
    writeEventsFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['events:InvokeFunction'],
      resources: ['*'],
    }));

    // HTTP API Gateway
    const httpApi = new HttpApi(this, `${serviceName}-HttpApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET],
        allowHeaders: ['*'],
      },
    });

    const authorizerConstruct = new ApiGatewayLambdaAuthorizer(this, `${serviceName}-authorizer`, {
      appName,
      tableName: context.tableName,
      lambdaExecutionRole,
    });

    httpApi.addRoutes({
      path: route,
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-get-v1',
        getEventsFunction
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    const distribution = new ApiCloudFrontDistribution(
      this,
      `${id}-dist`,
      {
        subdomain: subdomain,
        env,
        httpApiId: httpApi.httpApiId,
      }
    );

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${getEventsFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
  }
}
