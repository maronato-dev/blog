# Load env
FROM node:lts-alpine as base

ENV HOST 0.0.0.0

WORKDIR /app

RUN mkdir /app/node_modules

## add user
RUN addgroup -S user && adduser -S user -G user
RUN chown -R user:user /app/node_modules && chmod -R 755 /app/node_modules

COPY ./dev-entrypoint.sh /docker-entrypoint.sh

CMD ["yarn", "dev"]

RUN chmod a+x /docker-entrypoint.sh

# switch to non-root user
USER user

ENTRYPOINT ["/docker-entrypoint.sh"]
