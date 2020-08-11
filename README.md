# playwright-aws-lambda

Support for PlayWright running on AWS Lambda and Google Cloud Functions.

NOTE: Currently only Chromium is supported.

## Install

```shell
npm install playwright-core playwright-aws-lambda --save
```

## Usage

This package works with the `nodejs8.10`, `nodejs10.x` and `nodejs12.x` AWS
Lambda runtimes out of the box.

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

| Method / Property | Returns                                  | Description                    |
| ----------------- | ---------------------------------------- | ------------------------------ |
| `launchChromium`  | `{!Promise<playwright.ChromiumBrowser>}` | Launches the Chromium browser. |

## Thanks / Credits

This project is based on the work of
[chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda).
