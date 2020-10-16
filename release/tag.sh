#!/bin/bash
set -e

# Tags are in the form date and release attempt number
# e.g. 2019-02-12_01.
readonly TAG_PREFIX="$(date +%Y-%m-%d)_"
readonly TAG="${TAG_PREFIX}$(printf %02d $(git tag -l "${TAG_PREFIX}*" | wc -l))"
readonly BRANCH=${2:-master}

git fetch origin $BRANCH
git tag "${TAG}" origin/$BRANCH
git push --tags origin

echo $TAG
