#!/bin/bash
# Sobe o Impact7 local em modo producao para teste de fumaça no sandbox.
cd "$(dirname "$0")/.."

# Postgres local
if ! su pguser -c "psql 'postgres://postgres@127.0.0.1:5433/impact7' -tc 'select 1'" >/dev/null 2>&1; then
  PGBIN=$(ls -d /usr/lib/postgresql/*/bin | head -1)
  su pguser -c "$PGBIN/pg_ctl -D /tmp/pgdata -o '-p 5433 -k /tmp' -l /tmp/pg.log start" >/dev/null 2>&1
  sleep 3
fi

pkill -f "tsx server/_core/index.ts" 2>/dev/null
sleep 1

set -a
source .env.local
DATABASE_URL="postgres://postgres@127.0.0.1:5433/impact7"
NODE_ENV=production
PORT=3000
set +a

nohup npx tsx server/_core/index.ts > /tmp/impact7-server.log 2>&1 &
sleep 10
tail -6 /tmp/impact7-server.log
echo "=== HTTP ==="
curl -s -o /dev/null -w "GET / -> %{http_code}\n" http://localhost:3000/
