import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { Construct } from 'constructs/lib/construct';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';

const serviceName = "SongLookup";
const appName = "song-lookup-service-app";
const handler = "handlers.songlookup";
const route = "/api/v1/lookup";

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env');
    const context = this.node.tryGetContext(env);

    // IAM Role for Lambda
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
        ],
      })
    );

    const lambdaFunction = new lambda.Function(this, `${serviceName}-function`, {
      code: lambda.Code.fromAsset(`../../../dist/apps/${appName}`),
      handler: handler,
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLENAME: context.tableName,
        STAGE: env, // Use a context or environment variable if this needs to be dynamic
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(90),
    });

    // HTTP API Gateway
    const httpApi = new HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET],
      },
    });

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

    httpApi.addRoutes({
      path: route,
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-get-v1',
        lambdaFunction
      ),
      //authorizer: auth,
    });

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${lambdaFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
  }
}
