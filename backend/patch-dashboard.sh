#!/bin/sh
# Increase admin dashboard file upload limit from 1MB to 200MB
# Patches BOTH the source dist AND the built public assets

# 1. Source dist (chunk files loaded by some code paths)
DASHBOARD_DIR="/app/server/node_modules/@medusajs/dashboard/dist"
find "$DASHBOARD_DIR" -type f \( -name "*.js" -o -name "*.mjs" \) -exec \
  sed -i 's/DEFAULT_MAX_FILE_SIZE = 1024 \* 1024;/DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 200;/g' {} + 2>/dev/null

# 2. Built admin assets (the actual files served to browsers - minified)
ADMIN_ASSETS="/app/server/public/admin/assets"
if [ -d "$ADMIN_ASSETS" ]; then
  # Replace minified 1048576 (1024*1024) with 209715200 (200*1024*1024)
  find "$ADMIN_ASSETS" -type f -name "*.js" -exec \
    sed -i 's/=1048576/=209715200/g' {} +
  # Also handle unminified pattern
  find "$ADMIN_ASSETS" -type f -name "*.js" -exec \
    sed -i 's/=1024\*1024;/=1024*1024*200;/g' {} +
  echo "Patched admin assets upload limit to 200MB"
fi

echo "Dashboard upload limit patched"
