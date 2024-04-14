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

const serviceName = 'SongEval';
const appName = 'song-eval-service-app';
const handler = 'handlers.songeval';
const route = '/api/v1/eval';
const subdomain = 'songeval';

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

    const lambdaFunction = new lambda.Function(
      this,
      `${serviceName}-function`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: handler,
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );

    const getConfigFunction = new lambda.Function(
      this,
      `getConfigFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: 'handlers.getConfig',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );

    const addAllowListWordFunction = new lambda.Function(
      this,
      `addAllowlistWordFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: 'handlers.addAllowListWord',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );

    const removeAllowListWordFunction = new lambda.Function(
      this,
      `removeAllowlistWordFunction`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: 'handlers.removeAllowListWord',
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );

    // HTTP API Gateway
    const httpApi = new HttpApi(this, `${serviceName}-HttpApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.DELETE],
        allowHeaders: ['*'],
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

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/config',
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-config-v1',
        getConfigFunction
      ),
    });

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/allowlist',
      methods: [HttpMethod.PUT],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-allowlist-add-v1',
        addAllowListWordFunction
      ),
    });

    httpApi.addRoutes({
      path: '/api/v1/{streamerId}/allowlist',
      methods: [HttpMethod.DELETE],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'api-allowlist-remove-v1',
        removeAllowListWordFunction
      ),
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
  }
}
