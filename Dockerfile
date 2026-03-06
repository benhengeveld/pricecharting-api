FROM oven/bun:alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --chown=appuser:appgroup package.json bun.lock tsconfig.json ./

RUN bun install --frozen-lockfile --production

COPY --chown=appuser:appgroup src/ ./src/

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
