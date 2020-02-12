import { promises as fsPromises } from 'fs';
import { join } from 'path';
import * as playwright from 'playwright-core';
import isLambdaRuntimeEnvironment from './util/isLambdaRuntimeEnvironment';
import { LaunchOptions } from 'playwright-core/lib/server/browserType';
import isHeadlessModeEnabled from './util/isHeadlessModeEnabled';
import fileExists from './util/fileExists';
import setEnvironmentVariables from './util/setEnvironmentVariables';
import getMemorySize from './util/getMemorySize';

const { inflate } = require('lambdafs');

setEnvironmentVariables();

/**
 * Returns a list of recommended additional Chromium flags.
 */
export function getChromiumArgs(headless: boolean) {
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

  if (getMemorySize() >= 1024) {
    result.push('--memory-pressure-off');
  }

  if (headless === true) {
    result.push('--single-process');
  } else {
    result.push('--start-maximized');
  }

  return result;
}

async function getChromiumExecutablePath(
  headless: boolean
): Promise<string | undefined> {
  if (headless !== true) {
    return undefined;
  }

  if ((await fileExists('/tmp/chromium')) === true) {
    for (const file of await fsPromises.readdir('/tmp')) {
      if (file.startsWith('core.chromium') === true) {
        await fsPromises.unlink(`/tmp/${file}`);
      }
    }

    return '/tmp/chromium';
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
  const args = getChromiumArgs(headless);
  const executablePath = await getChromiumExecutablePath(headless);

  const browser = await playwright.chromium.launch({
    args,
    executablePath,
    headless,
    ...launchOptions,
  });

  return browser;
}
