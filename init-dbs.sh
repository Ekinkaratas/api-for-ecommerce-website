#!/bin/bash
set -e

echo "🚀 Running init-dbs.sh: Creating isolated DB users + databases..."

psql -v ON_ERROR_STOP=1 --username "$postgres" <<-EOSQL

    -- USER SERVICE
    DO
    \$do\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'user_service_user') THEN
            CREATE USER user_service_user WITH PASSWORD '${USER_DB_PASSWORD}';
        END IF;
    END
    \$do\$;
    CREATE DATABASE user_db OWNER user_service_user;

    -- PRODUCT SERVICE
    DO
    \$do\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'product_service_user') THEN
            CREATE USER product_service_user WITH PASSWORD '${PRODUCT_DB_PASSWORD}';
        END IF;
    END
    \$do\$;
    CREATE DATABASE product_db OWNER product_service_user;

    -- STORE SERVICE
    DO
    \$do\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'store_service_user') THEN
            CREATE USER store_service_user WITH PASSWORD '${STORE_DB_PASSWORD}';
        END IF;
    END
    \$do\$;
    CREATE DATABASE store_db OWNER store_service_user;

EOSQL

echo "🎉 Databases for user, product, and store services created successfully."
