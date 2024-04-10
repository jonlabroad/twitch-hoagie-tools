import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { ApiCloudFrontDistribution, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

const serviceName = 'Config';
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
      ]).role;

    //Ideally this is trigger from DynamoDB stream (with event bridge), but for now it will be a periodic
    const lambdaFunction = new lambda.Function(
      this,
      "onModsChangedFunction",
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handler.onModsChanged",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );
    const rule = new events.Rule(this, 'PeriodicTrigger', {
      schedule: events.Schedule.expression('rate(30 minutes)'),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFunction));

    /*
    // HTTP API Gateway
    const httpApi = new HttpApi(this, `${serviceName}-HttpApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET],
        allowHeaders: ['*'],
      },
    });
    */

    /*
    const auth = new authorizers.HttpLambdaAuthorizer(
      'TwitchAuthorizer',
      songEvalFunction, // this is not correct
      {
        authorizerName: 'twitchAuthenticator',
        identitySource: ['$request.header.Authorization'],
      }
    );
*/

/*
    httpApi.addRoutes({
      path: route,
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-get-v1',
        lambdaFunction
      ),
      //authorizer: auth,
    });

    const distribution = new ApiCloudFrontDistribution(
      this,
      `${id}-ApiCloudFrontDistribution`,
      {
        subdomain: subdomain,
        env,
        httpApiId: httpApi.httpApiId,
      }
    );

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${lambdaFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
*/
  }
}
