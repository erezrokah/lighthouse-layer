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

```ts
const lighthouse = require('lighthouse');
const log = require('lighthouse-logger');
const chromeLauncher = require('chrome-launcher');

// this lets us support invoke local
const chromePath = process.env.IS_LOCAL
  ? undefined
  : '/opt/nodejs/node_modules/@serverless-chrome/lambda/dist/headless-chromium';

const chromeFlags = [
  '--headless',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-zygote',
  '--no-sandbox',
  '--single-process',
  '--hide-scrollbars',
];

// utility function to run lighthouse
const runLighthouse = async url => {
  let chrome = null;
  try {
    chrome = await chromeLauncher.launch({ chromeFlags, chromePath });

    const options = {
      port: chrome.port,
      logLevel: 'info',
      output: 'html',
    };

    log.setLevel(options.logLevel);

    const { report: html, lhr } = await lighthouse(url, options);
    const { audits } = lhr;
    return { audits, html };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
};

// do something with runLighthouse
```
