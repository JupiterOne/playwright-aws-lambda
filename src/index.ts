import { promises as fsPromises } from 'fs';
import { join } from 'path';
import playwright from 'playwright-core';
import isLambdaRuntimeEnvironment from './isLambdaRuntimeEnvironment';
import { LaunchOptions } from 'playwright-core/lib/server/browserType';

const { inflate } = require('lambdafs');

if (isLambdaRuntimeEnvironment()) {
  if (process.env.FONTCONFIG_PATH === undefined) {
    process.env.FONTCONFIG_PATH = '/tmp/aws';
  }

  if (process.env.LD_LIBRARY_PATH === undefined) {
    process.env.LD_LIBRARY_PATH = '/tmp/aws/lib';
  } else if (process.env.LD_LIBRARY_PATH.startsWith('/tmp/aws/lib') !== true) {
    process.env.LD_LIBRARY_PATH = [
      ...new Set(['/tmp/aws/lib', ...process.env.LD_LIBRARY_PATH.split(':')]),
    ].join(':');
  }
}

/**
 * Returns a list of recommended additional Chromium flags.
 */
function getChromiumArgs(headless: boolean) {
  const result = [
    '--disable-background-timer-throttling',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-cloud-import',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gesture-typing',
    '--disable-hang-monitor',
    '--disable-infobars',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-offer-upload-credit-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--disable-tab-for-desktop-share',
    '--disable-translate',
    '--disable-voice-input',
    '--disable-wake-on-wifi',
    '--disk-cache-size=33554432',
    '--enable-async-dns',
    '--enable-simple-cache-backend',
    '--enable-tcp-fast-open',
    '--enable-webgl',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--media-cache-size=33554432',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--prerender-from-omnibox=disabled',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ];
  if (
    parseInt(
      process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE ||
        process.env.FUNCTION_MEMORY_MB ||
        '1024',
      10
    ) >= 1024
  ) {
    result.push('--memory-pressure-off');
  }
  if (headless === true) {
    result.push('--single-process');
  } else {
    result.push('--start-maximized');
  }
  return result;
}
async function fileExists(path: string) {
  try {
    await fsPromises.access(path);
    return true;
  } catch (err) {
    return false;
  }
}
function isHeadlessModeEnabled() {
  if (process.env.IS_LOCAL !== undefined) {
    return false;
  }
  return ['AWS_LAMBDA_FUNCTION_NAME', 'FUNCTION_NAME', 'FUNCTION_TARGET'].some(
    key => process.env[key] !== undefined
  );
}

async function getExecutablePath(
  headless: boolean
): Promise<string | undefined> {
  if (headless !== true) {
    return Promise.resolve(undefined);
  }

  if ((await fileExists('/tmp/chromium')) === true) {
    for (const file of await fsPromises.readdir('/tmp')) {
      if (file.startsWith('core.chromium') === true) {
        await fsPromises.unlink(`/tmp/${file}`);
      }
    }

    return Promise.resolve('/tmp/chromium');
  }

  const input = join(__dirname, 'bin');
  const promises = [
    inflate(`${input}/chromium.br`),
    inflate(`${input}/swiftshader.tar.br`),
  ];

  if (isLambdaRuntimeEnvironment()) {
    promises.push(inflate(`${input}/aws.tar.br`));
  }

  const result = await Promise.all(promises);
  return result.shift();
}

export async function launchChromium(launchOptions?: Partial<LaunchOptions>) {
  const headless = isHeadlessModeEnabled();
  const browser = await playwright.chromium.launch({
    args: getChromiumArgs(headless),
    // defaultViewport: chromium.defaultViewport,
    executablePath: await getExecutablePath(headless),
    headless,
    // headless: true
    ...launchOptions,
  });
  return browser;
}
