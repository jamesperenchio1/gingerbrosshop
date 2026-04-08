# Phase 5: Production Hardening

## Database Backups (WAL Archiving — Incremental)

Continuous WAL (Write-Ahead Log) archiving. Only captures actual changes. Enables point-in-time recovery.

### Postgres Config (via docker-compose.yml environment + custom conf)

Add to the postgres service in `docker-compose.yml`:

```yaml
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    mem_limit: 512m
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./data/wal-archive:/wal-archive
      - ./postgres-custom.conf:/etc/postgresql/conf.d/custom.conf:ro
    ports:
      - "127.0.0.1:5433:5432"
    command: >
      postgres
      -c archive_mode=on
      -c archive_command='cp %p /wal-archive/%f'
      -c wal_level=replica
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    networks:
      - gingerbros
```

### Directory Setup
```bash
mkdir -p /opt/gingerbros/data/wal-archive
mkdir -p /mnt/hdd/gingerbros-backups/basebackups
mkdir -p /mnt/hdd/gingerbros-backups/wal
```

### Weekly Base Backup + Continuous WAL

**Base backup script (`/opt/gingerbros/base-backup.sh`):**
```bash
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
```

### Cron Jobs
```bash
# Weekly base backup (Sunday 3am) + daily WAL rotation
0 3 * * 0  /opt/gingerbros/base-backup.sh >> /var/log/gingerbros-backup.log 2>&1
```

### Restore Procedure (Point-in-Time Recovery)
```bash
# 1. Stop the store
cd /opt/gingerbros && docker compose stop backend storefront

# 2. Remove current data
rm -rf /opt/gingerbros/data/postgres/*

# 3. Extract base backup
tar xzf /mnt/hdd/gingerbros-backups/basebackups/base_YYYYMMDD.tar.gz \
  -C /opt/gingerbros/data/postgres/

# 4. Copy WAL files for replay
cp /mnt/hdd/gingerbros-backups/wal/* /opt/gingerbros/data/postgres/pg_wal/

# 5. Create recovery signal
touch /opt/gingerbros/data/postgres/recovery.signal

# 6. Add restore command to postgresql.auto.conf
echo "restore_command = 'cp /wal-archive/%f %p'" >> \
  /opt/gingerbros/data/postgres/postgresql.auto.conf

# 7. Start postgres (will replay WAL to latest point)
docker compose up -d postgres
# Watch logs: docker compose logs -f postgres

# 8. Once recovered, start everything
docker compose up -d backend storefront
```

## Admin Dashboard Protection (Authentik SSO on public URL)

Caddy config for `api.gingerbrosshop.com`:

```caddyfile
http://api.gingerbrosshop.com {
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }

    # Admin dashboard — require Authentik SSO first
    @admin path /app*
    handle @admin {
        forward_auth 192.168.1.102:9000 {
            uri /outpost.goauthentik.io/auth/caddy
            copy_headers X-Authentik-Username X-Authentik-Groups X-Authentik-Email
            header_up X-Forwarded-Proto https
        }
        reverse_proxy 127.0.0.1:9001 {
            header_up X-Forwarded-Proto https
        }
    }

    # API endpoints — public (storefront needs them)
    handle {
        reverse_proxy 127.0.0.1:9001 {
            header_up X-Forwarded-Proto https
            header_up X-Forwarded-Host {host}
        }
    }
}
```

### Authentik Setup
1. Create Proxy Provider: forward auth (single application), external host `https://api.gingerbrosshop.com`
2. Create Application linked to provider
3. Assign admin group access only
4. `cd /opt/authentik && sudo docker compose restart server`

## Local Admin Backdoor (Tailscale)

Access admin directly via Tailscale IP — bypasses Cloudflare and Authentik entirely. Only reachable from your Tailscale network.

Tailscale IP: `100.120.24.102`

Add to Caddyfile:
```caddyfile
# Local admin backdoor — Tailscale only, no SSO
http://100.120.24.102:8080 {
    reverse_proxy 127.0.0.1:9001 {
        header_up X-Forwarded-Proto https
    }
}
```

Then Caddy listens on Tailscale IP port 8080 → straight to Medusa backend. Access at: `http://100.120.24.102:8080/app`

No Authentik, no Cloudflare, no DNS. Just Tailscale VPN → Caddy → Medusa login.

## Caddy Security Headers (Storefront)

```caddyfile
http://gingerbrosshop.com {
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }
    reverse_proxy 127.0.0.1:8000 {
        header_up X-Forwarded-Proto https
    }
}
```

## File Permissions

```bash
chmod 600 /opt/gingerbros/.env
chmod 600 /opt/gingerbros/storefront/.env.local
chmod 755 /opt/gingerbros/base-backup.sh
chown -R james:james /opt/gingerbros/data/
```

## Docker Restart Policies

All containers: `restart: unless-stopped`
- Auto-restart on crash + host reboot
- Only stays down if manually `docker compose stop`

## Network Isolation

All ports `127.0.0.1` only. The only paths in:
1. **Public**: Cloudflare → cloudflared → Caddy → container
2. **Admin backdoor**: Tailscale VPN → Caddy :8080 → Medusa backend
