#!/bin/sh
set -e

echo "🔐 Loading user DB URL..."
export DATABASE_URL=$(cat /run/secrets/user_db_url)

echo "ℹ️  Current NODE_ENV: '$NODE_ENV'"
echo "📦 Prisma Generate..."
npx prisma generate --schema=apps/user/prisma/schema.prisma

echo "🚚 Copying Prisma Engine to dist folder..."
mkdir -p dist/apps/user/src/generated/prisma

cp -r apps/user/src/generated/prisma/* dist/apps/user/src/generated/prisma/

if [ "$NODE_ENV" = "production" ]; then
  echo "🚀 PROD: Migrate Deploy executing..."
  npx prisma migrate deploy --schema=apps/user/prisma/schema.prisma
fi
echo "🚀 Starting user Service..."
node dist/apps/user/src/main.js