FROM node:22-slim AS builder
ARG NODE_ENV production

WORKDIR /iQbe

COPY --link ["package.json", "./"]
COPY --link ["scripts", "./scripts"]
COPY --link ["packages/backend/package.json", "./packages/backend/"]
COPY --link ["packages/frontend/package.json", "./packages/frontend/"]
COPY --link [".config", "./.config/"]

RUN npm install --omit=dev

COPY --link . ./

RUN npm run build

# --------------------------------------------------------------------
FROM node:22-slim AS prod
ARG NODE_ENV production

COPY --from=builder "/iQbe/node_modules" "./node_modules"
COPY --from=builder "/iQbe/packages/backend" "./packages/backend"
COPY --from=builder "/iQbe/package.json" "./package.json"
COPY --from=builder "/iQbe/.config" "./.config"
COPY . ./

EXPOSE 9000

CMD npm run start
