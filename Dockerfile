FROM oven/bun:alpine

WORKDIR /app

COPY --chown=bun:bun package.json bun.lock tsconfig.json ./

RUN bun install --frozen-lockfile --production

COPY --chown=bun:bun src/ ./src/

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
