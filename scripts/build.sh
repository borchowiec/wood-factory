#!/bin/bash

set -e

BASE_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )

ionic capacitor sync android

cd "${BASE_DIR}/android" && ./gradlew assembleDebug

rm -rf "${BASE_DIR}/build"
mkdir -p "${BASE_DIR}/build"

cp "${BASE_DIR}/android/app/build/outputs/apk/debug/"*.apk "${BASE_DIR}/build/app.apk"