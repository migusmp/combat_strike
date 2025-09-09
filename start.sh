#!/bin/bash

# -----------------------------
# Script para iniciar proyecto
# -----------------------------

# Función para comprobar si Docker está corriendo
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo "Docker no está corriendo. Por favor, inicia Docker."
        exit 1
    fi
}

# 1️⃣ Levantar la base de datos (Postgres)
check_docker

# Comprueba si ya existe un contenedor llamado gymdb
if [ "$(docker ps -aq -f name=gymdb)" ]; then
    echo "Contenedor 'gymdb' ya existe, arrancándolo..."
    docker start gymdb
else
    echo "Creando y arrancando contenedor 'gymdb'..."
    docker run -d \
        --name gymdb \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=gymdb \
        -p 5432:5432 \
        postgres:15-alpine
fi

# 2️⃣ Backend NestJS
echo "Iniciando backend..."
cd backend || exit
npm install
npm run start:dev &    # corre en segundo plano
cd ..

# 3️⃣ Frontend Next.js
echo "Iniciando frontend..."
cd frontend || exit
npm install
npm run dev &          # corre en segundo plano
cd ..

echo "✅ Backend en http://localhost:4000"
echo "✅ Frontend en http://localhost:3000"
echo "✅ Base de datos Postgres en localhost:5432 (usuario: postgres, contraseña: postgres)"
echo "Script terminado. Los procesos backend y frontend corren en segundo plano."

