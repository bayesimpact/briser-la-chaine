#!/bin/bash
# Script to run from an engineer computer to start the release process of the app.
#
# Usages:
# release/release.sh
# release/release.sh 2017-10-25_01
set -e
readonly DIRNAME=$(dirname "$0")
# Import functions echo_error, echo_warning...
source "$DIRNAME/echo_with_colors.sh"

if [ -n "$DRY_RUN" ]; then
  echo_warning 'DRY RUN: will not actually modify anything. This will not work without passing a tag.'
fi


# Start.
# $1 is an optional TAG name.
if [ -z "$1" ]; then
  if [ -n "$DRY_RUN" ]; then
    echo_error 'You cannot use DRY_RUN without passing a tag (creating a tag would not be a dry run :).'
    exit 1
  fi
  # Create a new tag if none given.
  readonly TAG=$("$DIRNAME/tag.sh")
  if [ -z "$TAG" ]; then
    echo_error 'Could not create new tag.'
    exit 2
  fi
  echo_success "Created new tag $TAG"
  echo_info "Starting release for tag $TAG"
  echo "A new CircleCI workflow should have been triggered after the creation of tag $TAG."
  echo 'In a few minutes the release will be built, tested and published, and then a message will'
  echo 'be sent on Slack to ask team members to manually test this new demo.'
else
  # Use the given tag.
  readonly TAG="$1"
  if [ -z "$(git tag -l $TAG)" ]; then
    echo_error "The tag $TAG does not exist locally."
    exit 3
  fi
  echo_info "Starting release for tag $TAG"
  echo 'A CircleCI workflow should have already been created for this tag. Once you have edited'
  echo 'notes for the release in this script, you will need to find this CircleCI workflow and'
  echo 'to rebuild the tasks that failed.'
fi


echo_success 'Draft release is now ready on Github!'
echo_info 'Now you need to wait for 2 team members to approve the demo of the release candidate.'
echo 'Then go to CircleCI to manually approve the `wait-for-manual-approval` step of the `release` workflow'
echo 'This will finally deploy the new release on OVH and AWS.'
