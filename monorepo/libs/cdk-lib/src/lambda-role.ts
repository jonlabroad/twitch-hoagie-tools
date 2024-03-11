import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BasicLambdaExecutionRoleConstruct extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, allowedActions: string[] = []) {
    super(scope, id);

    this.role = new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: allowedActions,
      })
    );
  }
}
