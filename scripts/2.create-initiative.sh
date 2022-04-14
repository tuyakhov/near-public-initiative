#!/usr/bin/env bash
set -e

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable" && exit 1
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$SPEAKER" ] && echo "Missing \$SPEAKER environment variable" && exit 1

echo
echo 'About to call create_initiative() on the contract'
echo near call \$CONTRACT create_initiative '' --account_id \$SPEAKER --amount \$1
echo
echo \$CONTRACT is $CONTRACT
echo \$SPEAKER is $SPEAKER
echo \$1 is [ $1 NEAR ] '(optionally attached amount)'
echo
near call $CONTRACT create_initiative '' --account_id $SPEAKER --amount $1
