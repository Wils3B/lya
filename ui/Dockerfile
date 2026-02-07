FROM node:24.12-alpine as base

WORKDIR /usr/src/ui
COPY . .

RUN corepack enable && \
    corepack prepare pnpm@latest-10 --activate

WORKDIR /usr/src/ui
COPY . .

FROM base as lya-ui
RUN pnpm install --frozen-lockfile

ENV PATH="/usr/src/ui/node_modules/.bin:$PATH"

RUN pnpm build
