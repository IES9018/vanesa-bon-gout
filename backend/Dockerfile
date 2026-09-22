# syntax=docker/dockerfile:1
# Imagen de produccion del backend Bon Gout (Express + TypeScript).
# Build multi-etapa: compila con devDeps y publica solo dist + prodDeps.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json jest.config.js eslint.config.mjs ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
