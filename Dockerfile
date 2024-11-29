FROM node:20.15.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache postgresql-client \
    && npm install

COPY . .

RUN echo -e "\
EMAIL_USER=${EMAIL_USER:-placeholder}\n\
EMAIL_PASS=${EMAIL_PASS:-placeholder}\n\
ALERT_EMAIL=${ALERT_EMAIL:-placeholder}\n\
PORT=3000\n\
ETH_MAIN_NET_URL=${ETH_MAIN_NET_URL:-'https://mainnet.infura.io/v3/'}\n\
ETH_SEPOLIA_NET_URL=${ETH_SEPOLIA_NET_URL:-'https://sepolia.infura.io/v3/'}\n\
AVALANCHE_FUJI_NET_URL=${AVALANCHE_FUJI_NET_URL:-'https://avalanche-fuji.infura.io/v3/'}\n\
INFURA_ID=${INFURA_ID:-1cc81f4ddef24f439bd8f8a1f811b0c0}\n\
DATABASE_URL=${DATABASE_URL:-'postgres://test:test@postgres:5432/aave_indexer'}\n\
NETWORK_TYPE=${NETWORK_TYPE:-'MAIN'}\n\
" > .env

EXPOSE 3000

CMD ["npm", "start"]