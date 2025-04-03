FROM node:22-slim 

WORKDIR /iQbe
COPY . ./

RUN apt-get update -y && apt-get install -y openssl
RUN echo -n "JWT_SECRET_KEY=" >> ./.config.env \
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config.env

RUN npm install
RUN npm install -w packages/backend/ ./packages/api
RUN npm install -w packages/frontend/ ./packages/api

RUN npm run build

CMD npm run start
