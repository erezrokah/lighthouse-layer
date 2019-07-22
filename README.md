# Lighthouse Lambda Layer

A Lambda layer with all the required dependencies to run Google Lighthouse.

## Prerequisites

[Nodejs](https://nodejs.org/en/) (at least version 8)

[Yarn](https://yarnpkg.com/lang/en/)

Amazon AWS account and `awscli` installed and configured: <https://aws.amazon.com/getting-started/>

Serverless [CLI](https://serverless.com/framework/docs/getting-started/)

## Setup

```bash
yarn
```

## Deploy

```bash
yarn deploy
```

### Usage

In your `serverless.yml`:

```yaml
functions:
  functionThatUsesLighthouse:
    layers:
      - layerArn # You'll have this after you run the deploy command
```

In you Lambda function:

```js

```
