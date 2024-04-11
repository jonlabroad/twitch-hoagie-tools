import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import * as logs from 'aws-cdk-lib/aws-logs';
import { ApiCloudFrontDistribution, BasicLambdaExecutionRoleConstruct } from '@hoagie/cdk-lib';
import * as awsEvents from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

const serviceName = 'ConfigService';
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

    const configUpdateFunction = new lambda.Function(
      this,
      `PeriodicConfigUpdate`,
      {
        code: lambda.Code.fromAsset(`../../dist/apps/${appName}`),
        handler: "handlers.periodicConfigUpdate",
        runtime: lambda.Runtime.NODEJS_18_X,
        environment: {
          TABLENAME: context.tableName,
          STAGE: env,
        },
        role: lambdaExecutionRole,
        timeout: cdk.Duration.seconds(90),
      }
    );
    const scheduleRule = new awsEvents.Rule(this, 'ScheduleRule', {
      enabled: true,
      schedule: awsEvents.Schedule.expression('rate(30 minutes)'),
    });
    scheduleRule.addTarget(new targets.LambdaFunction(configUpdateFunction));

    new logs.LogRetention(this, 'LogRetention', {
      logGroupName: `/aws/lambda/${configUpdateFunction.functionName}`,
      retention: logs.RetentionDays.TWO_MONTHS,
    });
  }
}
