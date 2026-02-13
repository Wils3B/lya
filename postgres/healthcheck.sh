#!/bin/bash
# PostgreSQL healthcheck script
# Uses environment variables: POSTGRES_USER, POSTGRES_DB

pg_isready -q -d "${POSTGRES_DB}" -U "${POSTGRES_USER}"
