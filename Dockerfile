FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY . ./

RUN pnpm install
RUN pnpm run build

CMD [ "pnpm", "start" ]