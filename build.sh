#!/bin/bash
set -e
echo "Running build script..."
echo "MAPBOX_TOKEN is set: $([ -n "$MAPBOX_TOKEN" ] && echo 'yes' || echo 'no')"
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' public/index.html > public/index.tmp && mv public/index.tmp public/index.html
echo "Token substitution complete."
grep -c '__MAPBOX_TOKEN__' public/index.html && echo "WARNING: placeholder still found!" || echo "All placeholders replaced."
