#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceStack } from '../lib/service-stack';

const stackName = "StreamRewardsStack";

const app = new cdk.App();
const env = app.node.tryGetContext('env');
new ServiceStack(app, `${stackName}-${env}`, {});
