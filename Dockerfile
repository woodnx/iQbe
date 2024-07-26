FROM node:20-slim AS builder
ENV NODE_ENV production

WORKDIR /iQbe

COPY [ "package.json", "./" ]
COPY [ "scripts", "./scripts" ]
COPY [ "packages/backend/package.json", "./packages/backend/" ]
COPY [ "packages/frontend/package.json", "./packages/frontend/" ]
COPY [ "packages/api/package.json", "./packages/api/" ]

RUN [ "npm", "install", "--omit=dev" ]

COPY --link --chown=node:node . ./

USER node

RUN [ "npm", "run", "api" ]
RUN [ "npm", "run", "build" ]

FROM node:20-slim AS prod

WORKDIR /iQbe

COPY --from=builder "/iQbe/packages/backend/built" "./packages/backend/built"
COPY --from=builder "/iQbe/node_modules" "./node_modules"
COPY --from=builder "/iQbe/package.json" "./package.json"

EXPOSE 9000

CMD [ "npm", "run", "start" ]