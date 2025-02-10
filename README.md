# Getting Started

## Setup Environment

```bash
docker compose up postgres -d

cp example.env .env
cp example.config.ts config.ts

# Setup db and migrations
npx prisma migrate dev --name init

docker compose down
```

## Run Bot

```bash
docker compose up postgres -d

# We need a running local blockchain
# Run this command in a separate shell
anvil

# Deploy smart contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url 127.0.0.1:8545 --broadcast --private-key 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

npm run start
# npm run start-dev # if you want to run the bot in watch mode

forge script script/CreateOrder.s.sol:CreateOrderScript --rpc-url 127.0.0.1:8545 --broadcast --private-key 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
```
