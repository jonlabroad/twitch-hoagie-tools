import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
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
import { ApiCloudFrontDistribution, ApiGatewayLambdaAuthorizer, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';

const serviceName = 'SongLookup';
const appName = 'song-lookup-service-app';
const handler = 'handlers.songlookup';
const route = '/api/v1/lookup';
const subdomain = 'songlookup';

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

    // Retrieve a parameter from AWS Systems Manager Parameter Store
    const spotifyClientId = ssm.StringParameter.fromStringParameterName(
      this,
      'spotifyClientId',
      'hoagietoolsSpotifyClientId'
    );
    const spotifyClientSecret = ssm.StringParameter.fromStringParameterName(
      this,
      'spotifyClientSecret',
      'hoagietoolsSpotifyClientSecret'
    );

    const lambdaFunction = new lambda.Function(
      this,
      `${serviceName}-function`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: handler,
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          SPOTIFY_CLIENT_ID: spotifyClientId.stringValue,
          SPOTIFY_CLIENT_SECRET: spotifyClientSecret.stringValue,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
        memorySize: 1024,
      }
    );

    // HTTP API Gateway
    const httpApi = new HttpApi(this, `${serviceName}-HttpApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.POST],
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
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-get-v1',
        lambdaFunction
      ),
      authorizer: authorizerConstruct.authorizer,
    });

    const distribution = new ApiCloudFrontDistribution(
      this,
      `${id}-ApiCloudFrontDistribution`,
      {
        subdomain,
        env,
        httpApiId: httpApi.httpApiId,
      }
    );

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${lambdaFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
  }
}
