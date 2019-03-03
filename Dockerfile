FROM node:8.6.0-alpine

ENV APP_KEY $APP_KEY
ENV JWT_SECRET $JWT_SECRET
ENV ALINODE_APPID $ALINODE_APPID
ENV ALINODE_SECRET $ALINODE_SECRET

RUN apk --update add tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# add npm package
COPY package.json /usr/src/app/package.json

RUN npm i --registry=https://registry.npm.taobao.org

# copy code
COPY . /usr/src/app

EXPOSE 7001

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

CMD /wait && APP_KEY=${APP_KEY} JWT_SECRET=${JWT_SECRET} ALINODE_APPID=${ALINODE_APPID} ALINODE_SECRET=${ALINODE_SECRET} npm start
