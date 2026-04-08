# Phase 1: Infrastructure Setup

## Directory Structure
```
/opt/gingerbros/
├── docker-compose.yml
├── .env                    # chmod 600
├── backend/
│   ├── Dockerfile
│   ├── medusa-config.ts
│   ├── package.json
│   └── src/
│       └── scripts/
│           └── seed.ts
├── storefront/
│   ├── Dockerfile
│   └── .env.local
├── base-backup.sh          # weekly base backup script
└── data/
    ├── postgres/           # volume mount
    ├── redis/              # volume mount
    ├── wal-archive/        # WAL files before rotation to HDD
    └── uploads/            # Medusa file uploads
```

## Docker Compose (`/opt/gingerbros/docker-compose.yml`)

```yaml
services:
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

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    mem_limit: 256m
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - gingerbros

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    mem_limit: 1g
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    env_file: .env
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
    ports:
      - "127.0.0.1:9001:9000"
    volumes:
      - ./data/uploads:/app/uploads
    networks:
      - gingerbros

  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    restart: unless-stopped
    mem_limit: 512m
    depends_on:
      - backend
    env_file: ./storefront/.env.local
    environment:
      MEDUSA_BACKEND_URL: http://backend:9000
    ports:
      - "127.0.0.1:8000:8000"
    networks:
      - gingerbros

networks:
  gingerbros:
    driver: bridge
```

## Environment File (`/opt/gingerbros/.env`)

```bash
# PostgreSQL
POSTGRES_USER=gingerbros
POSTGRES_PASSWORD=<openssl rand -base64 24>
POSTGRES_DB=gingerbros_medusa

# Medusa Secrets
JWT_SECRET=<openssl rand -hex 32>
COOKIE_SECRET=<openssl rand -hex 32>

# CORS
STORE_CORS=https://gingerbrosshop.com
ADMIN_CORS=https://api.gingerbrosshop.com
AUTH_CORS=https://gingerbrosshop.com,https://api.gingerbrosshop.com

# Public backend URL (browsers use this)
MEDUSA_BACKEND_URL=https://api.gingerbrosshop.com

# Stripe (Thai account — supports native PromptPay)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Generate secrets:
```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "COOKIE_SECRET=$(openssl rand -hex 32)"
```

## Caddy Config (append to `/etc/caddy/Caddyfile`)

Full Caddy blocks are in [05-production.md](./05-production.md) (includes security headers, Authentik SSO on /app, Tailscale backdoor). Summary:

```
http://gingerbrosshop.com        → 127.0.0.1:8000  (storefront, public)
http://api.gingerbrosshop.com    → 127.0.0.1:9001  (API public, /app behind Authentik SSO)
http://100.120.24.102:8080       → 127.0.0.1:9001  (Tailscale admin backdoor, no SSO)
```

Then: `sudo systemctl reload caddy`

## Cloudflare Configuration

### DNS Records (Cloudflare Dashboard)
| Type  | Name | Content | Proxy |
|-------|------|---------|-------|
| CNAME | @    | `<tunnel-id>.cfargotunnel.com` | Proxied |
| CNAME | api  | `<tunnel-id>.cfargotunnel.com` | Proxied |

### Tunnel Ingress (Zero Trust > Tunnels)
| Public hostname | Service |
|----------------|---------|
| `gingerbrosshop.com` | `http://localhost:80` |
| `api.gingerbrosshop.com` | `http://localhost:80` |

## Port Map (avoiding conflicts)

| Port | Service | Binding |
|------|---------|---------|
| 5432 | Authentik Postgres (EXISTING) | — |
| 5433 | Gingerbros Postgres (NEW) | 127.0.0.1 |
| 6379 | Gingerbros Redis (NEW) | 127.0.0.1 |
| 9000 | Authentik (EXISTING) | — |
| 9001 | Medusa backend (NEW) | 127.0.0.1 |
| 8000 | Next.js storefront (NEW) | 127.0.0.1 |

## Memory Budget
Total new: ~2.3GB max (Postgres 512MB + Redis 256MB + Backend 1GB + Storefront 512MB)
Available: ~6.5GB — comfortable fit.
