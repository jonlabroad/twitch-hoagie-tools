import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface DistributionProps {
  subdomain: string;
  env: string;
  httpApiId: string;
}

const certificateArn = 'arn:aws:acm:us-east-1:796987500533:certificate/34ddd63f-ae46-4812-a2ee-39b9594d8ef2';

export class ApiCloudFrontDistribution extends Construct {
  constructor(scope: Construct, id: string, props: DistributionProps) {
    super(scope, id);

    const domainName = `${props.subdomain}-${props.env}.hoagieman.net`;
    const region = cdk.Stack.of(this).region;

    const certificate = Certificate.fromCertificateArn(this, `${id}-Certificate`, certificateArn);

    // Create a custom Cache Policy that forwards all query strings
    const cachePolicy = new cloudfront.CachePolicy(this, `cachepolicy`, {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      // Additional cache policy configurations as needed
    });

    const distribution = new cloudfront.Distribution(this, `${id}-Distribution`, {
      defaultBehavior: {
        origin: new HttpOrigin(`${props.httpApiId}.execute-api.${region}.amazonaws.com`, {
          originShieldRegion: region,
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy
      },
      certificate,
      domainNames: [domainName],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
    });

    // Output the distribution domain name for easy access
    new cdk.CfnOutput(this,  `${id}-DistributionDomainName`, {
      value: distribution.distributionDomainName,
    });
  }
}
