#!/bin/bash
set -e
echo "Running build script..."
echo "MAPBOX_TOKEN is set: $([ -n "$MAPBOX_TOKEN" ] && echo 'yes' || echo 'no')"
mkdir -p public
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' src.html > public/index.html
echo "Build complete."
