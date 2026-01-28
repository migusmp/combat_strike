# CombatStrike — Plataforma de Cursos (Next.js + NestJS + Postgres + Nginx + Docker) ⚡🥋

**CombatStrike** es una plataforma **full-stack** para **explorar cursos**, **publicarlos** y **comprarlos**, con **frontend en Next.js**, **backend en NestJS** y **PostgreSQL**, desplegable mediante **Docker Compose** y servido detrás de **Nginx** como reverse proxy.

Este repositorio está pensado como proyecto **público de portfolio**: arquitectura clara, setup reproducible y enfoque en buenas prácticas.

---

## ✨ Funcionalidades

- **Catálogo de cursos** (listado y detalle).
- **Publicación / subida de cursos** (panel de gestión según rol).
- **Compra de cursos** y acceso al contenido tras la compra *(según implementación actual)*.
- **Autenticación** y sesiones mediante JWT.
- **Emails transaccionales** (p. ej. verificación / notificaciones) *(según implementación actual)*.
- **PostgreSQL** como base de datos principal.

---

## 🧱 Arquitectura

Browser
|
v
Nginx (80)
|------------------> /api/* -> NestJS (backend :4000)
|
'------------------> /* -> Next.js (frontend :3000)

PostgreSQL (:5432) <---------------- NestJS


---

## 🗂️ Estructura del repositorio

.
├─ backend/ # NestJS (API)
├─ frontend/ # Next.js (Web)
├─ nginx/
│ └─ default.conf # Reverse proxy
├─ docker-compose.yml # Stack completo
└─ README.md


---

## ✅ Requisitos

- Docker
- Docker Compose

---

## 🚀 Levantar el proyecto (Docker)

### 1) Clonar
```bash
git clone <tu-repo>
cd combat_strike
2) Arrancar el stack
docker compose up -d --build
3) Acceso
Web (via Nginx): http://localhost

API (via Nginx): http://localhost/api

Frontend directo (debug): http://localhost:3000

Backend directo (debug): http://localhost:4000

Postgres: localhost:5433 (mapeado a db:5432 dentro de Docker)

🧩 Docker Compose (servicios)
db (PostgreSQL 16)
Contenedor: postgres:16

Puerto host: 5433

Volumen persistente: db_data

backend (NestJS)
Puerto: 4000

Se conecta a Postgres por red interna Docker usando db:5432

frontend (Next.js)
Puerto: 3000

Variable pública de API: NEXT_PUBLIC_API_URL

nginx
Puerto: 80

Reverse proxy:

/ → frontend:3000

/api/ → backend:4000

🌐 Nginx reverse proxy
Archivo: nginx/default.conf

Frontend

GET / → http://frontend:3000

Backend

GET /api/* → http://backend:4000/*

Nota: el backend se publica con prefijo /api, pero Nginx lo “desprefija” al hacer:
location /api/ { proxy_pass http://backend:4000/; }

🔐 Variables de entorno y seguridad
Este repo incluye configuración por environment: en docker-compose.yml.
Para hacerlo público sin filtrar secretos, lo recomendado es:

Mover credenciales a .env

Versionar solo .env.example

Añadir .env al .gitignore

Ejemplo recomendado (.env.example)
# Postgres
POSTGRES_USER=admin
POSTGRES_PASSWORD=changeme
POSTGRES_DB=combatstrikedb
POSTGRES_PORT_HOST=5433

# Backend
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=changeme
DATABASE_NAME=combatstrikedb
JWT_SECRET=changeme
PORT=4000

# Email (si aplica)
EMAIL_USER=changeme@example.com
EMAIL_PASS=changeme

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
Y en docker-compose.yml usar:
env_file:
  - .env
IMPORTANTE: si vas a hacer el repo público, rota ya:

contraseña de Postgres

EMAIL_PASS

JWT_SECRET
Aunque luego los borres del repo, podrían quedar en el historial de git.

🧪 Comandos útiles
Ver logs
docker compose logs -f --tail=200
Reiniciar un servicio
docker compose restart backend
Parar todo
docker compose down
Parar y borrar volúmenes (⚠️ borra la BD)
docker compose down -v
🛣️ Roadmap (mejoras típicas)
 .env + .env.example (sin secretos en git)

 Healthcheck en backend y frontend

 CORS y NEXT_PUBLIC_API_URL apuntando a Nginx (http://localhost/api)

 CI (lint/test/build) con GitHub Actions

 Rate limiting / security headers en Nginx

 Tests e2e del backend (Nest Testing + supertest)

📄 Licencia
Recomendado para portfolio: MIT (añadir LICENSE).

Autor
Miguel

LinkedIn: <tu-linkedin>

Portfolio: <tu-portfolio>

Email: <tu-email-profesional>