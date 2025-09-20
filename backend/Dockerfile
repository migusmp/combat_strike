FROM node:20

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install --legacy-peer-deps

# Copiamos todo el código
COPY . .

# Copiar .env (producción)
COPY .env.production .env

# Compilamos TypeScript
RUN npm run build

# Exponemos el puerto
EXPOSE 4000

# Ejecutamos la app en producción
CMD ["npm", "run", "start:prod"]
