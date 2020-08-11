#/bin/bash

set -ex

LOG_FILE="log.txt"

echo "Running lambda function"
docker run --rm -v "$PWD":/var/task:ro,delegated lambci/lambda:nodejs12.x examples/stub.handler '{"url": "https://google.com"}' &> "$LOG_FILE"
grep -Fq "Google" "$LOG_FILE"
echo "Sucessfully passed test"
rm "$LOG_FILE"