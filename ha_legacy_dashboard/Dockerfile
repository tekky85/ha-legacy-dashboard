ARG BUILD_FROM=node:22-alpine
FROM ${BUILD_FROM} AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force


ARG BUILD_FROM=node:22-alpine
FROM ${BUILD_FROM}

ARG BUILD_ARCH=amd64
ARG BUILD_VERSION=0.0.0-dev
ARG BUILD_REVISION=unknown
ARG BUILD_DATE=unknown
ARG APP_SOURCE_PATH=.

LABEL io.hass.version="${BUILD_VERSION}" \
      io.hass.type="app" \
      io.hass.arch="${BUILD_ARCH}" \
      org.opencontainers.image.source="https://github.com/tekky85/ha-legacy-dashboard" \
      org.opencontainers.image.title="HA Legacy Dashboard" \
      org.opencontainers.image.description="Lightweight Home Assistant dashboard for legacy wall displays" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${BUILD_REVISION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="ISC"

ENV NODE_ENV=production \
    APP_VERSION=${BUILD_VERSION} \
    PORT=3000 \
    BIND_ADDRESS=0.0.0.0 \
    HA_RUNTIME_MODE=home_assistant_app \
    DATA_DIR=/data \
    DASHBOARD_CONFIG_PATH=/data/dashboards.json

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY LICENSE ./LICENSE
COPY src ./src
COPY ${APP_SOURCE_PATH}/run.sh /run.sh

RUN chmod 0755 /run.sh && mkdir -p /data

EXPOSE 3000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

CMD ["/run.sh"]
