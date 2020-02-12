import isLambdaRuntimeEnvironment from './isLambdaRuntimeEnvironment';

let environmentVariablesSet = false;

export default function setEnvironmentVariables() {
  if (environmentVariablesSet || !isLambdaRuntimeEnvironment()) {
    environmentVariablesSet = true;
    return;
  }

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

  environmentVariablesSet = true;
}
