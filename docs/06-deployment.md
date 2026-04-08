# Phase 6: Deployment & Verification

## Deployment Sequence

### Step 1: Create directory structure
```bash
sudo mkdir -p /opt/gingerbros/{backend,storefront,data/{postgres,redis,uploads}}
sudo chown -R james:james /opt/gingerbros
```

### Step 2: Scaffold backend
```bash
cd /tmp
npx create-medusa-app@latest --skip-db --no-browser gingerbros-backend
cp -r /tmp/gingerbros-backend/* /opt/gingerbros/backend/
cp -r /tmp/gingerbros-backend/.* /opt/gingerbros/backend/ 2>/dev/null
```

### Step 3: Write config files
- `/opt/gingerbros/docker-compose.yml`
- `/opt/gingerbros/.env` (generate secrets with openssl)
- `/opt/gingerbros/backend/medusa-config.ts`
- `/opt/gingerbros/backend/Dockerfile`
- `/opt/gingerbros/backend/src/scripts/seed.ts`

### Step 4: Clone storefront
```bash
cd /opt/gingerbros
git clone https://github.com/medusajs/nextjs-starter-medusa.git storefront
cd storefront && npm install && npm install framer-motion
```
- Write Dockerfile
- Write .env.local
- Ensure `output: "standalone"` in next.config.js

### Step 5: Start database + cache
```bash
cd /opt/gingerbros
docker compose up -d postgres redis
docker compose ps  # wait for healthy
```

### Step 6: Initialize Medusa
```bash
# Migrations
docker compose run --rm backend npx medusa db:migrate

# Create admin
docker compose run --rm backend npx medusa user \
  -e gingerbros.brew@gmail.com -p '<password>'

# Start backend
docker compose up -d backend

# Verify
curl http://127.0.0.1:9001/health
```

### Step 7: Admin setup (browser)
1. Go to `https://api.gingerbrosshop.com/app`
2. Login with admin credentials
3. Generate publishable API key
4. Copy key to `storefront/.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

### Step 8: Seed data
```bash
docker compose run --rm backend npx medusa exec ./src/scripts/seed.ts
```

### Step 9: Start storefront
```bash
docker compose up -d storefront
curl http://127.0.0.1:8000
```

### Step 10: Production hardening
```bash
# Set file permissions
chmod 600 /opt/gingerbros/.env
chmod 600 /opt/gingerbros/storefront/.env.local

# Create backup directories
mkdir -p /mnt/hdd/gingerbros-backups/{basebackups,wal}

# Install base backup script
chmod 755 /opt/gingerbros/base-backup.sh

# Set up weekly base backup cron (Sunday 3am)
sudo crontab -l | { cat; echo "0 3 * * 0 /opt/gingerbros/base-backup.sh >> /var/log/gingerbros-backup.log 2>&1"; } | sudo crontab -

# Test base backup
/opt/gingerbros/base-backup.sh
ls -la /mnt/hdd/gingerbros-backups/basebackups/

# Verify WAL archiving is active
docker exec gingerbros-postgres-1 psql -U gingerbros -c "SHOW archive_mode;"
# Should show: on
```

### Step 11: Caddy + Cloudflare
```bash
# Edit Caddyfile:
#   - gingerbrosshop.com → storefront
#   - api.gingerbrosshop.com → backend (with Authentik forward auth on /app)
#   - Security headers on both
sudo systemctl reload caddy

# In Cloudflare Dashboard:
# 1. Add DNS CNAME records for @ and api
# 2. Add tunnel ingress rules for both hostnames
```

### Step 12: Authentik admin protection
1. Create Proxy Provider in Authentik for api.gingerbrosshop.com (forward auth, single app)
2. Create Application linked to provider
3. Assign admin group access
4. `cd /opt/authentik && sudo docker compose restart server`

### Step 13: Upload product images
- Through Medusa admin: Products → each product → Media → upload

## Verification Checklist

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | Postgres healthy | `docker compose ps postgres` | healthy |
| 2 | Redis healthy | `docker compose ps redis` | healthy |
| 3 | Backend health | `curl http://127.0.0.1:9001/health` | 200 OK |
| 4 | Storefront renders | `curl http://127.0.0.1:8000` | HTML |
| 5 | Admin loads | Browser → `https://api.gingerbrosshop.com/app` | Login page |
| 6 | Storefront public | Browser → `https://gingerbrosshop.com` | Homepage |
| 7 | Products visible | Browse storefront catalog | 3 products |
| 8 | Add to cart | Click add to cart | Cart updates |
| 9 | Stripe checkout | Test card `4242 4242 4242 4242` | Order created |
| 10 | PromptPay QR | Select PromptPay at checkout | QR displayed |
| 11 | No port conflicts | `ss -tlnp \| grep -E '9000\|5432'` | Only Authentik |
| 12 | Logs clean | `docker compose logs --tail=20 backend` | No errors |
| 13 | HTTPS works | `curl -I https://gingerbrosshop.com` | 200, HTTPS |
| 14 | Admin SSO gate | Browser → admin URL (not logged into Authentik) | Redirects to Authentik login |
| 15 | Base backup works | `/opt/gingerbros/base-backup.sh` | .tar.gz in /mnt/hdd/gingerbros-backups/basebackups/ |
| 16 | WAL archiving on | `docker exec gingerbros-postgres-1 psql -U gingerbros -c "SHOW archive_mode;"` | on |
| 17 | Tailscale backdoor | `curl http://100.120.24.102:8080/health` | 200 OK |
| 18 | No LAN exposure | `curl http://192.168.1.102:9001/health` from another device | Connection refused |

## Archive Old Project

After everything verified:
```bash
tar czf ~/gingerbrosshop-backup-$(date +%Y%m%d).tar.gz ~/gingerbrosshop/
# Optionally remove later: rm -rf ~/gingerbrosshop/
```

## Credentials Storage

Add to `~/authentik-user-credentials.txt`:
```
=== Gingerbros Store (Medusa) ===
Admin URL: https://api.gingerbrosshop.com/app
Email: gingerbros.brew@gmail.com
Password: <the-password-used>
Storefront: https://gingerbrosshop.com
Postgres User: gingerbros
Postgres DB: gingerbros_medusa
```

## Monitoring

```bash
# Container health
docker compose -f /opt/gingerbros/docker-compose.yml ps

# Resource usage
docker stats --no-stream $(docker compose -f /opt/gingerbros/docker-compose.yml ps -q)

# Logs
docker compose -f /opt/gingerbros/docker-compose.yml logs -f backend --tail=50
docker compose -f /opt/gingerbros/docker-compose.yml logs -f storefront --tail=50
```
