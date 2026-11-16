FROM node:24-bookworm-slim AS build
ARG UPSTREAM_COMMIT=a4df932547b4becd61c9e05e63a0208a13cdf1f7
RUN apt-get update && apt-get install -y --no-install-recommends git python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN git init . && git remote add origin https://github.com/tashfeenahmed/freellmapi.git && git fetch --depth 1 origin ${UPSTREAM_COMMIT} && git checkout --detach FETCH_HEAD
COPY deploy/gateway/patch-unified-key.mjs /tmp/patch-unified-key.mjs
RUN node /tmp/patch-unified-key.mjs server/src/db/index.ts
RUN npm ci --include=dev --no-audit --no-fund && npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
ENV HOST=0.0.0.0
ENV FREELLMAPI_INSTALL_METHOD=docker
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/desktop/package.json ./desktop/package.json
COPY deploy/gateway/start.mjs ./start.mjs
RUN mkdir -p /app/server/data && chown -R node:node /app
USER node
EXPOSE 10000
CMD ["node", "start.mjs"]