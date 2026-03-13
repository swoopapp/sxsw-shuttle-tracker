#!/bin/bash
# Replace placeholder with Mapbox token from environment variable
sed -i.bak "s|__MAPBOX_TOKEN__|${MAPBOX_TOKEN}|g" public/index.html
rm -f public/index.html.bak
