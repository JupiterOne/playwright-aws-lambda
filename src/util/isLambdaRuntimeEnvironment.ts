export default function isLambdaRuntimeEnvironment(): boolean {
  return ['AWS_Lambda_nodejs10.x', 'AWS_Lambda_nodejs12.x'].includes(
    process.env.AWS_EXECUTION_ENV as string
  );
}
