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
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

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

    // Retrieve a parameter from AWS Systems Manager Parameter Store
    const spotifyClientId = ssm.StringParameter.fromStringParameterName(this, "spotifyClientId", 'hoagietoolsSpotifyClientId');
    const spotifyClientSecret = ssm.StringParameter.fromStringParameterName(this, "spotifyClientSecret", 'hoagietoolsSpotifyClientSecret');

    const lambdaFunction = new lambda.Function(this, `${serviceName}-function`, {
      code: lambda.Code.fromAsset(`../../../dist/apps/${appName}`),
      handler: handler,
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLENAME: context.tableName,
        SPOTIFY_CLIENT_ID: spotifyClientId.stringValue,
        SPOTIFY_CLIENT_SECRET: spotifyClientSecret.stringValue,
        STAGE: env, // Use a context or environment variable if this needs to be dynamic
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(90),
    });

    // HTTP API Gateway
    const httpApi = new HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.POST],
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
      methods: [HttpMethod.POST],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-get-v1',
        lambdaFunction
      ),
      //authorizer: auth,
    });

    // CloudFront Distribution
    const domainName = `songlookup-${env}.hoagieman.net`;
    const certificateArn = 'arn:aws:acm:us-east-1:796987500533:certificate/34ddd63f-ae46-4812-a2ee-39b9594d8ef2';
    const certificate = Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new HttpOrigin(`${httpApi.httpApiId}.execute-api.${this.region}.amazonaws.com`, {
          originShieldRegion: 'us-east-1',
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate,
      domainNames: [domainName],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
    });

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${lambdaFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
  }
}
