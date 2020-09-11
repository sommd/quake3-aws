#!/usr/bin/env ts-node-script

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as assets from "@aws-cdk/aws-s3-assets";

const app = new cdk.App();
const stack = new cdk.Stack(app);

// Context inputs

// Location of pak0.pk3 file relative to the current directory
const pak0 = stack.node.tryGetContext("pak0") || "./pak0.pk3";
// Location of start-up script for the Quake 3 server
const serverCfg = stack.node.tryGetContext("serverCfg") || "./default.cfg";
// Instance type to create, must be anx86_64 instance type
const instanceType = stack.node.tryGetContext("instanceType") || "t3.micro";
// SSH key name to use (must already exist in AWS)
const keyName = stack.node.tryGetContext("keyName");

// VPC (Because we're forced to have one)

const vpc = new ec2.Vpc(stack, "Vpc", {
  maxAzs: 1,
  subnetConfiguration: [{ name: "public", subnetType: ec2.SubnetType.PUBLIC }],
});

// SecurityGroup

const securityGroup = new ec2.SecurityGroup(stack, "SecurityGroup", { vpc });
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH");
securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(27960), "Quake");

// Instance

const instance = new ec2.Instance(stack, "Instance", {
  instanceType: new ec2.InstanceType(instanceType),
  machineImage: ec2.MachineImage.latestAmazonLinux({
    generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    cpuType: ec2.AmazonLinuxCpuType.X86_64,
  }),
  init: ec2.CloudFormationInit.fromElements(
    ec2.InitFile.fromAsset("/pak0.pk3", pak0),
    ec2.InitFile.fromAsset("/server.cfg", serverCfg),
    ec2.InitFile.fromAsset("/setup.sh", "./setup.sh", { mode: "000755" }),
    ec2.InitCommand.argvCommand(["/setup.sh"]),
  ),
  vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  securityGroup,
  keyName,
});

// Outputs

new cdk.CfnOutput(stack, "InstanceIP", { value: instance.instancePublicIp });

app.synth();
