FROM node:24.12-alpine as base

RUN corepack enable && \
    corepack prepare pnpm@latest-10 --activate

WORKDIR /usr/src/api
COPY . .

FROM base as lya-api
RUN pnpm install --frozen-lockfile

ENV PATH="/usr/src/api/node_modules/.bin:$PATH"

RUN pnpm build
