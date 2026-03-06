FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production

COPY src/ ./src/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app \
    && chown -R appuser:appgroup /home/appuser

USER appuser

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
