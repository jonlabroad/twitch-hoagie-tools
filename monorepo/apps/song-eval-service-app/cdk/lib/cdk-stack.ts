import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { Construct } from 'constructs/lib/construct';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class SongEvaluationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext("env");
    const context = this.node.tryGetContext(env);

    // IAM Role for Lambda
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    lambdaExecutionRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
    }));

    // Lambda Function
    const songEvalFunction = new lambda.Function(this, 'SongEvalFunction', {
      code: lambda.Code.fromAsset('../../../dist/apps/song-eval-service-app'),
      handler: 'handlers.songeval',
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
    const auth = new authorizers.HttpLambdaAuthorizer('TwitchAuthorizer', songEvalFunction, {
      authorizerName: 'twitchAuthenticator',
      identitySource: ['$request.header.Authorization'],
    });
*/

    httpApi.addRoutes({
      path: '/api/v1/eval',
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration("eval-get-v1", songEvalFunction),
      //authorizer: auth,
    });
  }
}
