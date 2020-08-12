#/bin/bash

set -ex

LOG_FILE="log.txt"

function run_test {
    test_file="$1"
    echo "Testing $newfile against $oldfile"

    echo "Running test: $test_file"
    docker run --rm -v "$PWD":/var/task:delegated lambci/lambda:nodejs12.x "buildbots/assets/$test_file.handler" '{"url": "https://google.com"}' 2>&1 | tee "$LOG_FILE"
    grep -Fq "inside-lambda: Passed tests" "$LOG_FILE"

    echo "Sucessfully passed test: $test_file"
}

run_test "test-font"
run_test "test-default"

rm "$LOG_FILE"
