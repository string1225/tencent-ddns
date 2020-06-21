FROM node:12-alpine
ENV secureId=DEFAULT_ID secureKey=DEFAULT_KEY domain=DEFAULT_DOMAIN checkInterval=60 debugLevel=default
COPY . /app
WORKDIR /app
CMD node main.js $secureId $secureKey $domain $checkInterval $debugLevel