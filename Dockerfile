FROM node:10.6.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git curl yarn

WORKDIR /usr/src/app

COPY package.json .npmrc ./

RUN yarn

ENV PORT 8000

EXPOSE 8000

COPY . ./

RUN ln -s /usr/src/app/node_modules/@bower_components /usr/src/app/app/libs

ARG COMMIT
ENV COMMIT $COMMIT

CMD [ "node", "server" ]
