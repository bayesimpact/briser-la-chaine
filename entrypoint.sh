#!/bin/bash

set -e

# This runs a npm script in silent mode without explicitly calling `npm run`. To run a verbose npm
# script, enter the full command `npm run my-script`.
if npm run | grep "^  $1\$"; then
    npm run -s $@
else
    $@
fi
