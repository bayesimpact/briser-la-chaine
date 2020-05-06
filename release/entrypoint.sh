#!/bin/bash

readonly JS_APP_FILES="/usr/share/app/html/assets/*.js"

function replace_string() {
  from=$1; to=$2; shift; shift
  from_pattern="$(sed -e 's/[]\/$*.^|[]/\\&/g' <<< "$from")"
  to_replacement="$(sed -e 's/[\/&]/\\&/g' <<< "$to")"
  sed -i -e "s/${from_pattern}/${to_replacement}/g" $@
}

# TODO(cyrille): Try to find a better way to do that.
replace_string 'environment:"production"' 'environment:"demo"' "$JS_APP_FILES"

# TODO(pascal): Try to find a way to run the command if any.
nginx -g 'daemon off;'
