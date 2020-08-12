const playwright = require('../../dist/src/');
const assert = require('assert');

exports.handler = async (event, context) => {
  let browser = null;

  try {
    const browser = await playwright.launchChromium();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(event.url || 'https://example.com');

    const data = await page.screenshot();
    assert(data.length > 0, 'Page screenshot is empty');

    assert((await page.title()) === 'Google', 'Title does not match');

    // Test so it does not crash
    await page.setContent('<span id="icon">🎭</span>');

    console.log('inside-lambda: Passed tests');
  } catch (error) {
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
