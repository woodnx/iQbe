##################### BUILD STAGE #####################
FROM node:20-slim AS builder
ENV NODE_ENV production

# 作業ディレクトリを指定 （ない場合は新規作成）
WORKDIR /iQbe

# 依存関係を示すファイルをコピー
COPY [ "package.json", "./" ]
COPY [ "scripts", "./scripts" ]
COPY [ "packages/backend/package.json", "./packages/backend/" ]
COPY [ "packages/frontend/package.json", "./packages/frontend/" ]

# 依存関係をインストール
RUN ["npm", "install", "--omit=dev"]

# ソースコードをコピー
COPY --link --chown=node:node . ./

USER node

# ビルド
RUN ["npm", "run", "build"]

##################### PRODUCTION STAGE #####################
FROM node:20-slim AS prod

# 作業ディレクトリを指定
WORKDIR /iQbe

COPY --from=builder "/iQbe/packages/backend/built/" "./packages/backend/built/"
COPY --from=builder "/iQbe/node_modules" "./node_modules/"
COPY --from=builder "/iQbe/package.json" "./package.json"

# ポートを指定
EXPOSE 9000

CMD ["npm", "run", "start"]
