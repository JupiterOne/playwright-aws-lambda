export default function getMemorySize() {
  return parseInt(
    process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE ||
      process.env.FUNCTION_MEMORY_MB ||
      '1024',
    10
  );
}
