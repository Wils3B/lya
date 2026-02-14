#!/bin/sh
set -e

# Create LYA user and database using environment variables
# Using backticks for identifiers and quoted values for password
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  CREATE USER IF NOT EXISTS '${LYA_DB_USERNAME}'@'%' IDENTIFIED BY '${LYA_DB_PASSWORD//\'/\'\'}';
  CREATE DATABASE IF NOT EXISTS \`${LYA_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  GRANT ALL PRIVILEGES ON \`${LYA_DB_NAME}\`.* TO '${LYA_DB_USERNAME}'@'%' WITH GRANT OPTION;
  FLUSH PRIVILEGES;
EOSQL
