FROM node:23-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

# TODO: I could optimize this to have a build and production phase? Maybe create another Dockerfile.dev for development and one for production.

COPY . .

ENTRYPOINT ["npm","run", "dev"]
