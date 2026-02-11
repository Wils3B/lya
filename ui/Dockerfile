FROM node:24.12-alpine AS base

ARG PNPM_VERSION=latest-10
ARG USERNAME=lyauser
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    deluser --remove-home node && \
    addgroup -g $USER_GID $USERNAME && \
    adduser -u $USER_UID -G $USERNAME -D $USERNAME

USER $USERNAME
WORKDIR /home/$USERNAME/ui

FROM base AS lya-ui
COPY --chown=$USERNAME:$USERNAME . .
RUN pnpm install --frozen-lockfile

ENV PATH="/home/$USERNAME/ui/node_modules/.bin:$PATH"
RUN pnpm build
