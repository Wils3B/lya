FROM node:24.12-alpine as base

ARG PNPM_VERSION=latest-10
ARG USERNAME=lyauser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    deluser --remove-home node && \
    addgroup -g $USER_GID $USERNAME && \
    adduser -u $USER_UID -G $USERNAME -D $USERNAME && \
    mkdir -p /home/$USERNAME/api && \
    chown -R $USERNAME:$USERNAME /home/$USERNAME/api

USER $USERNAME
WORKDIR /home/$USERNAME/api

FROM base as lya-api
COPY --chown=$USERNAME:$USERNAME . .
RUN pnpm install --frozen-lockfile

ENV PATH="/home/$USERNAME/api/node_modules/.bin:$PATH"

RUN pnpm build
