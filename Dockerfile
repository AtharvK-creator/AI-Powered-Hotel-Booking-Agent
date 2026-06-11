# Stage 1: Build the React client
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the Node/Express server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

# Copy client built assets
COPY --from=client-builder /app/client/dist ./client/dist

# Setup server production build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --only=production
COPY --from=server-builder /app/server/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
