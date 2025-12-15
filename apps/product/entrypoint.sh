#!/bin/sh
set -e

echo "🔐 Loading product DB URL..."
export DATABASE_URL=$(cat /run/secrets/product_db_url)

echo "ℹ️  Current NODE_ENV: '$NODE_ENV'"

echo "📦 Prisma Generate..."
npx prisma generate --schema=apps/product/prisma/schema.prisma

echo "🚚 Copying Prisma Engine to dist folder..."
mkdir -p dist/apps/product/src/generated/prisma

cp -r apps/product/src/generated/prisma/* dist/apps/product/src/generated/prisma/

if [ "$NODE_ENV" = "production" ]; then
  echo "🚀 PROD: Migrate Deploy executing..."
  npx prisma migrate deploy --schema=apps/product/prisma/schema.prisma
fi
echo "🚀 Starting product Service..."
node dist/apps/product/src/main.js