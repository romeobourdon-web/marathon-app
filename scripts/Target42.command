#!/bin/zsh
# Lanceur Target 42 : double-clic dans le Finder (une fenêtre Terminal s'ouvre).
# Ouvre Docker Desktop si besoin, puis lance « npm run app » (Supabase + app + navigateur).
# Fermer la fenêtre ou Ctrl + C arrête l'app.

# Node 24 (Homebrew) et Docker, même si le Terminal n'a pas chargé ~/.zshrc
export PATH="/opt/homebrew/opt/node@24/bin:/opt/homebrew/bin:$HOME/.docker/bin:/usr/local/bin:$PATH"

# Dossier du projet : celui du script (scripts/..) ; sinon l'emplacement habituel (copie sur le Bureau).
PROJECT_DIR="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)"
if [ ! -f "$PROJECT_DIR/package.json" ] || ! grep -q '"name": "target-42"' "$PROJECT_DIR/package.json"; then
  PROJECT_DIR="$HOME/Desktop/Centrale G1/DEFI G1G2/Application marathon"
fi
cd "$PROJECT_DIR" || { echo "Dossier du projet introuvable : $PROJECT_DIR"; read -k1 "?Appuie sur une touche pour fermer."; exit 1; }

echo "Target 42 — $PROJECT_DIR"

# Docker Desktop : l'ouvrir s'il ne tourne pas, puis attendre qu'il soit prêt (2 min max).
if ! docker info >/dev/null 2>&1; then
  echo "▶ Ouverture de Docker Desktop…"
  open -a Docker
  for i in {1..120}; do
    docker info >/dev/null 2>&1 && break
    sleep 1
  done
  if ! docker info >/dev/null 2>&1; then
    echo "✗ Docker ne répond pas. Ouvre Docker Desktop à la main, puis relance."
    read -k1 "?Appuie sur une touche pour fermer."
    exit 1
  fi
  echo "  Docker est prêt."
fi

npm run app
