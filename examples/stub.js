const playwright = require('../dist/src/');

exports.handler = async (event, context) => {
  let browser = null;

  try {
    const browser = await playwright.launchChromium();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(event.url || 'https://example.com');
    const data = await page.screenshot();
    if (data.length === 0) {
      throw new Error(`Screenshot is empty`);
    }
    console.log('Page title: ', await page.title());
  } catch (error) {
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
