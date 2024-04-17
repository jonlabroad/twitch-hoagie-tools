import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import { ApiCloudFrontDistribution, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const appName = 'streamer-service-app';
const subdomain = 'streamer';

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env');
    const context = this.node.tryGetContext(env);

    const lambdaExecutionRole = new BasicLambdaExecutionRoleConstruct(this, `lambda-role`,
      [
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'ecs:DescribeServices',
      ]).role;

    const getStreamHistory = new lambda.Function(
      this,
      `GetStreamHistory`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.getStreamHistory",
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
    const httpApi = new HttpApi(this, `StreamerApi`, {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET],
        allowHeaders: ['*'],
      },
    });

    httpApi.addRoutes({
      path: "/api/v1/{streamerId}/streamhistory",
      methods: [HttpMethod.GET],
      integration: new apigwIntegrations.HttpLambdaIntegration(
        'streamhistory-get-v1',
        getStreamHistory,
      ),
      //authorizer: auth,
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
