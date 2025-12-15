#!/bin/sh
set -e

echo "🔐 Loading store DB URL..."
export DATABASE_URL=$(cat /run/secrets/store_db_url)

echo "📦 Prisma Generate..."
npx prisma generate --schema=apps/store/prisma/schema.prisma

if [ "$NODE_ENV" = "production" ]; then
  echo "🚀 Migrate Deploy..."
  npx prisma migrate deploy --schema=apps/store/prisma/schema.prisma
fi
echo "🚀 Starting store Service..."
node dist/apps/src/main.js
