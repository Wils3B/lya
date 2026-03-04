#!/bin/sh

# Check if .lya-db file exists
if [ ! -f .lya-db ]; then
  echo "No active database stored. Use 'task stop:postgres' (or mysql/mariadb/mongodb) explicitly." >&2
  exit 1
fi

# Read the active database type from .lya-db
db_type=$(cat .lya-db)

# Call the appropriate stop task
case "$db_type" in
  postgres|mysql|mariadb|mongodb|sqlite)
    task "stop:$db_type"
    ;;
  *)
    echo "Unknown database type: $db_type" >&2
    exit 1
    ;;
esac