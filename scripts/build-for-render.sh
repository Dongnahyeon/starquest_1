#!/bin/bash
set -e

echo "Building server..."
npm run build

echo "Building web client..."
npx expo export -p web --output-dir dist/web || mkdir -p dist/web

echo "Build complete!"
