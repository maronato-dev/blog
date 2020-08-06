FROM node:lts-alpine as base

# Inject environment so we can build the image
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG DOMAIN
ENV DOMAIN=$DOMAIN
ARG PRERENDER_URL
ENV PRERENDER_URL=$PRERENDER_URL
ARG GHOST_API_KEY
ENV GHOST_API_KEY=$GHOST_API_KEY
ARG FIREBASE_PROJECT_ID
ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
ARG GHOST_API_DOMAIN
ENV GHOST_API_DOMAIN=$GHOST_API_DOMAIN
ARG COMMENTO_DOMAIN
ENV COMMENTO_DOMAIN=$COMMENTO_DOMAIN
ENV HOST 0.0.0.0

WORKDIR /app

# Install prod env
FROM base as install

# Install server
COPY ./server/package.json /app/server/
COPY ./server/yarn.lock /app/server/
RUN cd ./server && yarn install

# Install frontend
COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install

RUN printenv && sleep 60
# Build frontend
COPY ./ /app/
RUN yarn build

FROM base as final
COPY --from=install /app/dist/ /app/dist/
COPY --from=install /app/server/ /app/server/

WORKDIR /app/server/

## add user
RUN addgroup -S user && adduser -S user -G user
RUN chown -R user:user /app/server && chmod -R 755 /app/server
# switch to non-root user
USER user

CMD ["yarn", "start"]
