# syntax=docker/dockerfile:1.6

############################
# deps stage
############################
FROM node:22-slim AS deps

WORKDIR /iQbe

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# 依存解決に必要なファイルだけ先にコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/*/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    PNPM_STORE_DIR=/pnpm/store \
    pnpm -r install --frozen-lockfile


############################
# build stage
############################
FROM node:22-slim AS build

WORKDIR /iQbe

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
COPY --from=deps /iQbe /iQbe
COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    PNPM_STORE_DIR=/pnpm/store \
    pnpm -r install --frozen-lockfile

# build 用にダミーの.env ファイルを作成
RUN mkdir -p .config && echo "JWT_SECRET_KEY=dummy" > .config/.env
RUN pnpm run build

############################
# runtime stage (Prod)
############################
FROM node:22-slim AS runner

WORKDIR /iQbe
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

COPY --from=build /iQbe /iQbe

# devDependencies を削除
RUN CI=true pnpm prune --prod

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "run", "start"]