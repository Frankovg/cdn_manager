#!/bin/bash

set -eux

pnpm i

pnpm run lint
pnpm run test

pnpm build
