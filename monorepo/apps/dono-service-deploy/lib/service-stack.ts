import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import { ApiCloudFrontDistribution, ApiGatewayLambdaAuthorizer, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

const serviceName = 'DonoService';
const appName = 'dono-service-app-cdk';
const subdomain = 'dono';

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

    const getdono = new lambda.Function(this, 'GetDono', {
      code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
      handler: "handlers.getdono",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLENAME: context.tableName,
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    const twitchChatEvents = new lambda.Function(this, 'TwitchChatEvents', {
      code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
      handler: "handlers.twitchchatevents",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLENAME: context.tableName,
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });
    const rule = new events.Rule(this, 'TwitchChatEventsRule', {
      eventPattern: {
        source: ['hoagie.twitch-chat'],
      },
    });

    // Add the Lambda function as a target for the EventBridge rule
    rule.addTarget(new targets.LambdaFunction(twitchChatEvents));


    const appSyncApi = new appsync.GraphqlApi(this, 'GraphqlApi', {
      name: 'dono-gql-api',
      definition: appsync.Definition.fromFile('../../libs/dono-service/src/lib/appsync/getDonosSchema.graphql'),
      xrayEnabled: false,
    });

    const getDonosFunction = new lambda.Function(
      this,
      `GetDonos`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getdonos",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(30),
        memorySize: 1024,
      }
    );

    const getDonosDataSource = appSyncApi.addLambdaDataSource('getDonosDataSource', getDonosFunction);

    getDonosDataSource.createResolver('GetDonosResolver', {
      typeName: 'Query',
      fieldName: 'listDonos',
    });

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

    const getRoutes = httpApi.addRoutes({
      path: "/api/v1/{streamerId}",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'dono-get-v1',
        getdono,
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    const distribution = new ApiCloudFrontDistribution(
      this,
      `distribution`,
      {
        subdomain: subdomain + "-new", // TODO remove "new" in order to switch over
        env,
        httpApiId: httpApi.httpApiId,
      }
    );

    new cdk.CfnOutput(this, 'GraphqlApiUrl', {
      value: appSyncApi.graphqlUrl,
    });
    getRoutes.map((route) => {
      new cdk.CfnOutput(this, 'GetDonoApiUrl', {
        value: route.path ?? "",
      });
    });
  }
}
