import { promises as fsPromises } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as https from 'https';

import * as playwright from 'playwright-core';
import { LaunchOptions } from 'playwright-core';

import isLambdaRuntimeEnvironment from './util/isLambdaRuntimeEnvironment';
import isHeadlessModeEnabled from './util/isHeadlessModeEnabled';
import fileExists from './util/fileExists';
import getEnvironmentVariables, {
  AWS_FONT_DIR,
} from './util/getEnvironmentVariables';

const { inflate } = require('lambdafs');

/**
 * Returns a list of recommended additional Chromium flags.
 */
export function getChromiumArgs(headless: boolean) {
  const result = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--disk-cache-size=33554432',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ];

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

  const input = path.join(__dirname, 'bin');
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

  const env: LaunchOptions['env'] = {
    ...(await getEnvironmentVariables()),
    ...(launchOptions?.env || {}),
  };
  const browser = await playwright.chromium.launch({
    args,
    executablePath,
    headless,
    env,
    ...launchOptions,
  });

  return browser;
}

export const loadFont = async (input: string) =>
  new Promise(async (resolve, reject) => {
    const url = new URL(input);
    const output = path.join(AWS_FONT_DIR, url.pathname.split('/').pop()!);
    if (await promisify(fs.exists)(output)) {
      resolve();
      return;
    }
    if (!fs.existsSync(AWS_FONT_DIR)) {
      await fsPromises.mkdir(AWS_FONT_DIR);
    }
    const stream = fs.createWriteStream(output);
    stream.once('error', (error) => {
      return reject(error);
    });
    https.get(input, (response) => {
      response.on('data', (chunk) => {
        stream.write(chunk);
      });

      response.once('end', () => {
        stream.end(() => {
          return resolve();
        });
      });
    });
  });
