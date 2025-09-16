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
  -p 5433:5432 \
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

# data .env
PORT=4000

DB_HOST=localhost
DB_PORT=5433
DB_USER=admin
DB_PASSWORD="REDACTED_DB_PASSWORD"
DB_NAME=combatstrikedb

EMAIL_USER=REDACTED_EMAIL
EMAIL_PASS=REDACTED_EMAIL_APP_PASSWORD 

JWT_SECRET="2,098hj_-09jklmokÑ-.,@%/__"

