FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY apps ./apps
COPY libs ./libs
RUN npm install

RUN npx nest build auth

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

CMD ["node", "dist/apps/auth/src/main.js"]
