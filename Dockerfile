FROM node:24 AS base

RUN npm i -g pnpm@10.14.0

WORKDIR /opt/ac

FROM base AS build

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM base AS runtime

ENV NODE_ENV=production

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install --prod --frozen-lockfile

COPY --from=build /opt/ac/dist ./dist
COPY .env.production .env

ENV HOST=0.0.0.0

CMD ["node", "dist/server/entry.mjs"]
