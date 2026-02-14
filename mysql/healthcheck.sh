#!/bin/bash
# MySQL healthcheck script
# Uses environment variables: MYSQL_ROOT_PASSWORD

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" > /dev/null 2>&1
