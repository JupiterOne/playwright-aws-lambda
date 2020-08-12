const playwright = require('../../dist/src/');
const assert = require('assert');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

exports.handler = async (event, context) => {
  let browser = null;

  try {
    await playwright.loadFont(
      'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf'
    );
    const browser = await playwright.launchChromium();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(event.url || 'https://example.com');

    const data = await page.screenshot();
    assert(data.length > 0, 'Page screenshot is empty');

    assert((await page.title()) === 'Google', 'Title does not match');

    await page.setContent('<span id="icon">🎭</span>');
    const emojiImage = await (await page.$('#icon')).screenshot();
    const img1 = PNG.sync.read(fs.readFileSync('buildbots/assets/emoji.png'));
    const img2 = PNG.sync.read(emojiImage);
    const { width, height } = img1;

    const imageMatches = pixelmatch(img1.data, img2.data, null, width, height, {
      threshold: 0.1,
    });
    assert(!imageMatches, 'font loading with emojis does not work');

    console.log('inside-lambda: Passed tests');
  } catch (error) {
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
