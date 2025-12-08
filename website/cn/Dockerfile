FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock* ./

RUN if [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile; \
    else \
    yarn install; \
    fi

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

RUN yarn install --production --ignore-scripts && \
    ln -sf ../next/dist/bin/next node_modules/.bin/next 2>/dev/null || true && \
    yarn cache clean && \
    rm -rf /tmp/* /var/tmp/*

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 80

CMD ["node_modules/.bin/next", "start"]
