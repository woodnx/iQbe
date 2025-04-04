FROM node:22-slim 

WORKDIR /iQbe
COPY . ./

RUN apt-get update -y && apt-get install -y openssl

RUN npm install

RUN echo -n "JWT_SECRET_KEY=" >> ./.config.env \
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config.env

RUN npm run build
CMD npm run start