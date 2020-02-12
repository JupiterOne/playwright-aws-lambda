export default function isHeadlessModeEnabled() {
  if (process.env.IS_LOCAL !== undefined) {
    return false;
  }
  return ['AWS_LAMBDA_FUNCTION_NAME', 'FUNCTION_NAME', 'FUNCTION_TARGET'].some(
    key => process.env[key] !== undefined
  );
}
