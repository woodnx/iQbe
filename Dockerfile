FROM node:22-slim AS builder
ENV NODE_ENV production

WORKDIR /iQbe

COPY --link ["package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/frontend/package.json", "./packages/frontend/"]

RUN npm install --omit=dev

COPY --link --chown=node:node . ./

USER node

RUN npm run build

FROM node:22-slim AS prod

WORKDIR /iQbe
USER node

COPY --chown=node:node --from=builder "/iQbe/packages/backend/dist" "./packages/backend/dist"
COPY --chown=node:node --from=builder "/iQbe/node_modules" "./node_modules"
COPY --chown=node:node --from=builder "/iQbe/package.json" "./package.json"

EXPOSE 9000

CMD npm run start
