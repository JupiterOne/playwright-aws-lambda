# playwright-aws-lambda

![CI](https://github.com/JupiterOne/playwright-aws-lambda/workflows/CI/badge.svg)
[![NPM](https://img.shields.io/npm/v/playwright-aws-lambda)](https://www.npmjs.com/package/playwright-aws-lambda)

Support for Playwright running on AWS Lambda and Google Cloud Functions.

**NOTE**: Currently only Chromium is supported.

## Install

```shell
npm install playwright-core playwright-aws-lambda --save
```

## Usage

This package works with the `nodejs10.x` and `nodejs12.x` AWS Lambda runtimes
out of the box.

```javascript
const playwright = require('playwright-aws-lambda');

exports.handler = async (event, context) => {
  let browser = null;

  try {
    const browser = await playwright.launchChromium();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(event.url || 'https://example.com');

    console.log('Page title: ', await page.title());
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
```

## API

| Method / Property | Returns                                  | Description                           |
| ----------------- | ---------------------------------------- | ------------------------------------- |
| `launchChromium`  | `{!Promise<playwright.ChromiumBrowser>}` | Launches the Chromium browser.        |
| `loadFont(url)`   | `{Promise<void>}`                        | Downloads and activates a custom font |

### Loading additional fonts

If you need custom font support by e.g. emojicons in your browser, you have to
load it by using the `loadFont(url: string)` function before you launch the
browser.

```js
await loadFont(
  'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
);
```

### Deploying as lambda layer

Run this command and then publish playwright-aws-lambda.zip on AWS Lambda Layer

```
git clone --depth=1 https://github.com/JupiterOne/playwright-aws-lambda.git && \
cd playwright-aws-lambda && \
make playwright-aws-lambda.zip
```

## Thanks / Credits

This project is based on the work of
[chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda).
