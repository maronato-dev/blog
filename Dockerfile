FROM alpine:3.12 as base

ENV HOST 0.0.0.0

RUN apk add nodejs

WORKDIR /app
RUN mkdir server

## add user
RUN addgroup -S user && adduser -S user -G user
RUN chown -R user:user /app/server && chmod -R 755 /app/server

# Install server
FROM node:lts-alpine as server

WORKDIR /app/server

# Install server as prod to cut on deps
ENV NODE_ENV=production
COPY ./server/package.json /app/server/
COPY ./server/yarn.lock /app/server/
COPY ./server/index.js /app/server/
RUN yarn install

# Install and build app
FROM node:lts-alpine as app

WORKDIR /app

ARG NODE_ENV=production

ARG DOMAIN=maronato.dev
ENV DOMAIN=$DOMAIN

ARG PRERENDER_URL=http://srv-captain--prerender:3000
ENV PRERENDER_URL=$PRERENDER_URL

ARG GHOST_API_KEY
ENV GHOST_API_KEY=$GHOST_API_KEY

ARG FIREBASE_PROJECT_ID
ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID

ARG GHOST_API_DOMAIN=blog.maronato.dev
ENV GHOST_API_DOMAIN=$GHOST_API_DOMAIN

ARG COMMENTO_DOMAIN=commento.maronato.dev
ENV COMMENTO_DOMAIN=$COMMENTO_DOMAIN

ARG FATHOM_SITE_ID=
ENV FATHOM_SITE_ID=$FATHOM_SITE_ID
ARG FATHOM_DOMAIN=fathom.maronato.dev
ENV FATHOM_DOMAIN=$FATHOM_DOMAIN

# Install frontend as dev so we can build later
ENV NODE_ENV=development
COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install

# Set desired environment from now on
ENV NODE_ENV=$NODE_ENV

# Build frontend
COPY ./ /app/
RUN yarn build

FROM base as final
COPY --from=app /app/dist/ /app/dist/
COPY --from=server /app/server/ /app/server/

# switch to non-root user
USER user

CMD ["node", "server"]
