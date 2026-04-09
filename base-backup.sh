#!/bin/bash
set -euo pipefail

BACKUP_DIR="/mnt/hdd/gingerbros-backups/basebackups"
WAL_ARCHIVE="/opt/gingerbros/data/wal-archive"
WAL_BACKUP="/mnt/hdd/gingerbros-backups/wal"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Take base backup
docker exec gingerbros-postgres-1 pg_basebackup \
  -U gingerbros -D /tmp/basebackup -Ft -z -Xs
docker cp gingerbros-postgres-1:/tmp/basebackup/base.tar.gz \
  "${BACKUP_DIR}/base_${TIMESTAMP}.tar.gz"
docker exec gingerbros-postgres-1 rm -rf /tmp/basebackup

# Rotate WAL files to HDD
if [ -d "$WAL_ARCHIVE" ] && [ "$(ls -A $WAL_ARCHIVE 2>/dev/null)" ]; then
  mv "$WAL_ARCHIVE"/* "$WAL_BACKUP"/ 2>/dev/null || true
fi

# Clean old base backups
find "$BACKUP_DIR" -name "base_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
# Clean old WAL files
find "$WAL_BACKUP" -type f -mtime +${RETENTION_DAYS} -delete

echo "Base backup: ${BACKUP_DIR}/base_${TIMESTAMP}.tar.gz"
