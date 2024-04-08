export default function isLambdaRuntimeEnvironment(): boolean {
  return [
    'AWS_Lambda_nodejs10.x',
    'AWS_Lambda_nodejs12.x',
    'AWS_Lambda_nodejs14.x',
    'AWS_Lambda_nodejs16.x',
    'AWS_Lambda_nodejs18.x',
    'AWS_Lambda_nodejs20.x',
  ].includes(process.env.AWS_EXECUTION_ENV as string);
}
