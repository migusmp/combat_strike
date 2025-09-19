FROM node:20
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Servir la app directamente en modo Node
CMD ["npm", "run", "dev"]
