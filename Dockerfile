FROM node:lts-alpine as base

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
