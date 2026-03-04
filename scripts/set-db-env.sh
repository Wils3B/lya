#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$root_dir/api/.env.database"
state_file="$root_dir/.lya-db"

db_type="${1:-}"
if [[ -z "$db_type" ]]; then
  echo "Usage: $0 <postgres|mysql|mariadb|mongodb|sqlite>" >&2
  exit 1
fi

case "$db_type" in
  postgres)
    cat >"$env_file" <<'EOF'
LYA_DB_TYPE=postgres
LYA_DB_HOST=postgres
LYA_DB_PORT=5432
LYA_DB_USERNAME=lya
LYA_DB_PASSWORD=lya
LYA_DB_NAME=lya
EOF
    ;;
  mysql)
    cat >"$env_file" <<'EOF'
LYA_DB_TYPE=mysql
LYA_DB_HOST=mysql
LYA_DB_PORT=3306
LYA_DB_USERNAME=lya
LYA_DB_PASSWORD=lya
LYA_DB_NAME=lya
EOF
    ;;
  mariadb)
    cat >"$env_file" <<'EOF'
LYA_DB_TYPE=mariadb
LYA_DB_HOST=mariadb
LYA_DB_PORT=3306
LYA_DB_USERNAME=lya
LYA_DB_PASSWORD=lya
LYA_DB_NAME=lya
EOF
    ;;
  mongodb)
    cat >"$env_file" <<'EOF'
LYA_DB_TYPE=mongodb
LYA_DB_URL=mongodb://lya:lya@mongodb:27017/lya
EOF
    ;;
  sqlite)
    cat >"$env_file" <<'EOF'
LYA_DB_TYPE=sqlite
LYA_DB_FILE=lya.sqlite
EOF
    ;;
  *)
    echo "Unknown database type: $db_type" >&2
    exit 1
    ;;
esac

echo "$db_type" > "$state_file"
echo "Wrote $env_file for $db_type"
echo "Wrote $state_file (for reference)"
