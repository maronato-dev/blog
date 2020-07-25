#!/bin/sh

echo "Building locally"
yarn build
echo "Done! Executing command"
exec "$@"
