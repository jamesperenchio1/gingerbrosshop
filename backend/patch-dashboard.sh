#!/bin/sh
# Increase admin dashboard file upload limit from 1MB to 200MB
DASHBOARD_DIR="/app/server/node_modules/@medusajs/dashboard/dist"
find "$DASHBOARD_DIR" -type f \( -name "*.js" -o -name "*.mjs" \) -exec \
  sed -i 's/DEFAULT_MAX_FILE_SIZE = 1024 \* 1024;/DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 200;/g' {} +
echo "Patched dashboard file upload limit to 200MB in all bundles"
