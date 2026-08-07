#!/bin/bash

set -eux

. /opt/ci-toolset/functions.sh

export GOOGLE_PROJECT=precise-truck-89123
export GOOGLE_ZONE=europe-west1-b

configure-google-cloud

make build

make lint
make test

eval "$(whisper build)"
whisper deploy

pnpm deploy

wave ar cdn-assets-manager --repo apps --source .
# wave deploy cdn-assets-manager --repo apps
