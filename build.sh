#!/bin/bash
set -e
echo "Running build script..."
echo "MAPBOX_TOKEN is set: $([ -n "$MAPBOX_TOKEN" ] && echo 'yes' || echo 'no')"
mkdir -p public
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' src.html > public/index.html
cp admin.html public/admin.html
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' driver.html > public/driver.html
cp ada.html public/ada.html
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' admin-ada.html > public/admin-ada.html
awk '{gsub(/__MAPBOX_TOKEN__/, ENVIRON["MAPBOX_TOKEN"]); print}' driver-ada.html > public/driver-ada.html
echo "Build complete."
