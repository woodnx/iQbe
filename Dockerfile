# syntax=docker/dockerfile:1.6

############################
# deps stage
############################
FROM node:22-slim AS deps

WORKDIR /iQbe

# 必要最低限のツール
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# pnpm を固定
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# 依存解決に必要なファイルだけ先にコピー（キャッシュの要）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/*/

# pnpm store を BuildKit cache に
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    PNPM_STORE_DIR=/pnpm/store \
    pnpm install --frozen-lockfile


############################
# build stage
############################
FROM node:22-slim AS build

WORKDIR /iQbe

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# node_modules を含めてコピー
COPY --from=deps /iQbe /iQbe
COPY . .

RUN pnpm run build


############################
# runtime stage (Prod)
############################
FROM node:22-slim AS runner

WORKDIR /iQbe
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# pnpm（prune 用）
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# ビルド成果物をコピー
COPY --from=build /iQbe /iQbe

# devDependencies を削除
RUN pnpm prune --prod

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "run", "start"]