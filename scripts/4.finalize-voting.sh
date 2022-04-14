#!/usr/bin/env bash
set -e

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable" && exit 1
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$SPEAKER" ] && echo "Missing \$SPEAKER environment variable" && exit 1

echo
echo 'About to call create_initiative() on the contract'
echo near call \$CONTRACT finalize_voting --account_id \$SPEAKER --gas=300000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$SPEAKER is $SPEAKER
echo
near call $CONTRACT finalize_voting --account_id $SPEAKER --gas=300000000000000
