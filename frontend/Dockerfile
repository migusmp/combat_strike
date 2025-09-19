# Build stage
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./

# Puerto que usa Next.js
EXPOSE 3000

# Ejecutamos Next.js en producción
CMD ["npm", "run", "start"]
