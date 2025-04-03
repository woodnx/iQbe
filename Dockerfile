FROM node:22-slim 

WORKDIR /iQbe

RUN apt-get update -y && apt-get install -y openssl
RUN echo -n "JWT_SECRET_KEY=" >> ./.config.env \
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));" >> ./.config.env

RUN npm install
COPY . ./

RUN npm run build

CMD npm run start

# FROM node:lts AS build
# WORKDIR /iQbe

# COPY /package*.json ./
# COPY package*.json ./

# RUN npm install
# COPY . .

# RUN npm run build

# FROM nginx:alpine AS runtime
# COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 8080
