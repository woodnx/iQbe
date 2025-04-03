# FROM node:22-slim 

# WORKDIR /iQbe

# RUN apt-get update -y && apt-get install -y openssl
# RUN echo -n "JWT_SECRET_KEY=" >> ./.config.env \
#     node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config.env

# RUN npm install
# COPY . ./

# RUN npm run build -w packages/api
# RUN npm run build

# CMD npm run start

FROM node:lts AS build
WORKDIR /iQbe

COPY packages/api/package*.json ./packages/api
COPY packages/backend/package*.json ./packages/backend
COPY packages/frontend/package*.json ./packages/frontend
COPY package*.json ./

RUN npm install --omit=dev
COPY . .

RUN npm run build

############################
FROM node:lts-slim AS runtime
WORKDIR /iQbe

COPY --from=build /iQbe/packages/backend/dist ./packages/backend/dist
COPY --from=build /iQbe/package.json ./package.json
COPY --from=build /iQbe/.config ./.config

RUN echo -n "JWT_SECRET_KEY=" >> ./.config.env \
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config.env

EXPOSE 9000

CMD npm run start
