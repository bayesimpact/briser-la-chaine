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

# TODO(pascal): Read from const.json5 and const_dist.json5
replace_string 'd789e78c35cf582b8a59175137eb53cb' 'a1067533ce6148de5bcac9df0ea0d508' "$JS_APP_FILES"
replace_string '1576288225722008' '1048782155234293' "$JS_APP_FILES"

# TODO(pascal): Try to find a way to run the command if any.
nginx -g 'daemon off;'
