FROM node:22-slim 

WORKDIR /iQbe
COPY . ./

RUN apt-get update -y && apt-get install -y openssl

RUN corepack enable pnpm

RUN pnpm install --frozen-lockfile

RUN mkdir -p .config && printf "JWT_SECRET_KEY=%s\n" "$(node -e \"console.log(require('crypto').randomBytes(32).toString('hex'));\")" >> ./.config/.env

RUN pnpm run build
CMD pnpm run start
