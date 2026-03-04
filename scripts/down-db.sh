#!/bin/sh

# Check if .lya-db file exists
if [ ! -f .lya-db ]; then
  echo "No active database stored. Use 'docker compose -f compose.yml -f compose.override.yml -f compose.<db_type>.yml down' (or mysql/mariadb/mongodb) explicitly." >&2
  exit 1
fi

# Read the active database type from .lya-db
db_type=$(cat .lya-db)

# Determine the appropriate compose files to use
if [ "$db_type" = "sqlite" ]; then
  docker compose -f compose.yml -f compose.override.yml down
else
  docker compose -f compose.yml -f compose.override.yml -f compose."$db_type".yml down
fi