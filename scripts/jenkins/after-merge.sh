#!/bin/bash

set -eux

. /opt/ci-toolset/functions.sh

export GOOGLE_PROJECT=precise-truck-89123
export GOOGLE_ZONE=europe-west1-b
export GOOGLE_CLUSTER=altipla

configure-google-cloud

make build

make lint

eval "$(whisper build)"
whisper deploy

pnpm run deploy

wave ar cdn-assets-manager --repo apps --source .
