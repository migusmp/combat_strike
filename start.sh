#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# CombatStrike - start.sh (limpio para público)
# Levanta el stack completo con Docker Compose
# -----------------------------

PROJECT_NAME="combatstrike"

check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Inicia Docker y vuelve a intentarlo."
    exit 1
  fi
}

check_env() {
  if [[ ! -f ".env" ]]; then
    echo "❌ Falta el archivo .env en la raíz del proyecto."
    echo "   Crea uno a partir de .env.example:"
    echo "   cp .env.example .env"
    exit 1
  fi
}

main() {
  check_docker
  check_env

  echo "🚀 Levantando ${PROJECT_NAME} con Docker Compose..."
  docker compose up -d --build

  echo ""
  echo "✅ Listo!"
  echo "   🌐 Web (Nginx):   http://localhost"
  echo "   🔌 API (Nginx):   http://localhost/api"
  echo "   🧠 Backend:       http://localhost:4000"
  echo "   🖥️  Frontend:      http://localhost:3000"
  echo ""
  echo "📜 Logs en vivo:"
  echo "   docker compose logs -f --tail=200"
}

main "$@"