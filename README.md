# combat_strike
comando para ejecutar el proyecto: docker compose up
docker-compose up --build

# para parar el proyecto: docker compose down
docker-compose down

# base de datos docker
docker run -d \
  --name combatstrikedb \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=REDACTED_DB_PASSWORD \
  -e POSTGRES_DB=combatstrikedb \
  -p 5432:5432 \
  postgres:15-alpine

# conectarse a la bbdd
docker exec -it combatstrikedb psql -U admin -d combatstrikedb

psql -h localhost -p 5432 -U admin -d combatstrikedb

# instalar backend
cd ./backend
pnpm install

# instalar frontend
cd ./frontend
pnpm install

# iniciar el backend
pnpm run start:dev
o
npm run start:dev

# iniciar el frontend
pnpm run dev
o
npm run dev

