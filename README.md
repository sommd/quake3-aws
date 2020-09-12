# quake3-aws

This is a small [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) template to quickly set up an ioquake3 server running on an EC2 instance with a public IP address and SSH access.

The default configuration uses a `t3.micro` instance which is eligible for [AWS Free Tier](https://aws.amazon.com/free/), so it should be free for 12 months and afterwards should cost _around_ \$5 a month if running 24/7. But the advantage of this template is that you can easily undeploy it whenever you're not using it, and redeploy it in ~5 minutes when you want to use it again, so you only pay for it while you're using it.

## Pre-requisites

- An AWS account
- [Node.JS](https://nodejs.org/) and [Yarn](https://yarnpkg.com/getting-started/install) installed
- A Quake 3: Arena retail `pak0.pk3` file (you can only get this from a retail or Steam copy of the game)

## Set-up

1.  [Create an IAM user](https://console.aws.amazon.com/iam/home#/users$new) if you don't already have one
    1. Enter a name and enable "Programmatic access" then click next
    2. Select "Attach existing policies directly" and select the "AdministratorAccess" policy then click next
    3. Add tags if you want then click next
    4. Click "Create user"
2.  Set up your AWS credentials if you haven't already
    1. Create `~/.aws/credentials` (remove comments):
    ```ini
    [default]
    aws_access_key_id = AAAAAAAAAAAAAAAAAAAA # Replace with the access key ID of your IAM user
    aws_secret_access_key = AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA # Replace with the secret access key of your IAM user
    ```
    2. Create `~/.aws/config` (remove comments):
    ```ini
    [default]
    region = ap-southeast-2 # Replace with the region you want to deploy to
    ```
3.  [Import your SSH key into EC2](https://console.aws.amazon.com/ec2/v2/home#ImportKeyPair::)
4.  Create `./cdk.context.json` (remove comments):
    ```jsonc
    {
      // Location of the retail pak0.pk3 file (default: ./pak0.pk3)
      "pak0": "/quake3/baseq3/pak0.pk3",
      // Location of a start-up script for the Quake 3 server (default: ./default.cfg)
      "serverCfg": "./my-start-up-script.cfg",
      // The EC2 instance type to user (default: t3.micro)
      "instanceType": "t3.micro",
      // The name of your SSH key in EC2
      "keyName": "my-key-name@hostname"
    }
    ```
5.  Run `yarn install` to install the project dependencies
6.  Run `yarn bootstrap` to bootstrap the AWS CDK

## Deploy

Run `yarn deploy`. The public IP address of your EC2 instance should be output once the deploy finishes.

## SSH

You can SSH into the server to run commands (e.g. to switch maps):

```
ssh quake@<IP-address>
```

You can also SSH into a regular shell:

```
ssh ec2-user@<IP-address>
```

## Undeploy

Run `yarn undeploy`.

## Development

- `yarn synth`: Run `cdk synth`, to output the generated Cloudformation template
- `yarn format`: Format everything with Prettier
- `yarn lint`: Check formatting, lint shell scripts and type-check
  - `yarn lint:prettier`: Just check formatting
  - `yarn lint:shellcheck`: Just lint shell scripts
  - `yarn lint:tsc`: Just type-check
