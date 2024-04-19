import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'; // Import the 'lambda' module
import { aws_apigatewayv2_authorizers, aws_iam } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib/core'; // Import the 'Duration' class from the 'core' module

export interface ApiGatewayLambdaAuthorizerProps {
  appName: string;
  tableName: string;
  lambdaExecutionRole: aws_iam.Role;
  handler?: string;
}

export class ApiGatewayLambdaAuthorizer extends Construct {
  public readonly authorizer: aws_apigatewayv2_authorizers.HttpLambdaAuthorizer;

  constructor(
    scope: Construct,
    id: string,
    props: ApiGatewayLambdaAuthorizerProps
  ) {
    super(scope, id);

    const lambdaAuthFunction = new lambda.Function(this, `Auth`, {
      code: lambda.Code.fromAsset(`../../dist/apps/${props.appName}`),
      handler: props.handler ?? 'handlers.authorizer',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLENAME: props.tableName,
      },
      role: props.lambdaExecutionRole,
      timeout: Duration.seconds(30),
      memorySize: 1024,
    });

    this.authorizer = new aws_apigatewayv2_authorizers.HttpLambdaAuthorizer(
      `${props.appName}-TwitchAuthorizer`,
      lambdaAuthFunction,
      {
        identitySource: ['$request.header.Authorization'],
        resultsCacheTtl: Duration.seconds(0),
        responseTypes: [
          aws_apigatewayv2_authorizers.HttpLambdaResponseType.SIMPLE,
        ],
      }
    );
  }
}
