FROM node:lts-alpine as base

ENV HOST 0.0.0.0

WORKDIR /app

RUN mkdir /app/node_modules

## add user
RUN addgroup -S user && adduser -S user -G user
RUN chown -R user:user /app/node_modules && chmod -R 755 /app/node_modules

# Install prod env
FROM base as install

COPY package.json /app/

RUN yarn install

COPY ./ /app/

FROM base as final

WORKDIR /app
COPY --from=install /app/ /app/

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

# Configure folder ownership
RUN chown -R user:user /app && chmod -R 755 /app

CMD ["yarn", "start"]

RUN chmod a+x /docker-entrypoint.sh

# switch to non-root user
USER user

ENTRYPOINT ["/docker-entrypoint.sh"]
