#!/bin/bash

set -eux

. /opt/ci-toolset/functions.sh

make build

make lint

eval "$(whisper build)"
whisper deploy

pnpm build
