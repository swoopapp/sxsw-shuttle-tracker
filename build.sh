#!/bin/bash
# Replace placeholder with Mapbox token from environment variable
export MAPBOX_TOKEN="${MAPBOX_TOKEN}"
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' public/index.html > public/index.tmp && mv public/index.tmp public/index.html
