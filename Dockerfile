FROM node:12-alpine
ENV secureId=DEFAULT_ID secureKey=DEFAULT_KEY domain=DEFAULT_DOMAIN checkInterval=60
COPY . /app
WORKDIR /app
RUN npm install
CMD node main.js $secureId $secureKey $domain $checkInterval