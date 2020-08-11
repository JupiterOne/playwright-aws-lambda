import { promises as fsPromises, existsSync } from 'fs';
import * as path from 'path';

import isLambdaRuntimeEnvironment from './isLambdaRuntimeEnvironment';

export const AWS_TMP_DIR = '/tmp/aws';
export const AWS_FONT_DIR = '/tmp/fonts';
const AWS_LIB_DIR = `${AWS_TMP_DIR}/lib`;

export default async function getEnvironmentVariables(): Promise<
  Record<string, string>
> {
  if (!isLambdaRuntimeEnvironment()) {
    return {};
  }
  const env: Record<string, string> = {};
  // If Chromium will be initialized without an FONTCONFIG_PATH or empty it crashes. To prevent
  // that we only set the custom font directory if the custom directory was created (by loadFont function)
  // alternatively set it to a non-existing directory.
  if (!process.env.FONTCONFIG_PATH && existsSync(AWS_FONT_DIR)) {
    env.FONTCONFIG_PATH = AWS_FONT_DIR;
    await fsPromises.writeFile(
      path.join(AWS_FONT_DIR, 'fonts.conf'),
      `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${AWS_FONT_DIR}</dir>
  <cachedir>/tmp/fonts-cache/</cachedir>
  <config></config>
</fontconfig>`
    );
  } else {
    env.FONTCONFIG_PATH = AWS_TMP_DIR;
  }

  if (!process.env.LD_LIBRARY_PATH) {
    env.LD_LIBRARY_PATH = AWS_LIB_DIR;
  } else if (!process.env.LD_LIBRARY_PATH.startsWith(AWS_LIB_DIR)) {
    env.LD_LIBRARY_PATH = [
      ...new Set([AWS_LIB_DIR, ...process.env.LD_LIBRARY_PATH.split(':')]),
    ].join(':');
  }
  return env;
}
