#!/bin/bash

# Script para configurar GitHub y hacer push inicial
# Uso: bash setup-github.sh

set -e

echo "🚀 Event Staffing Platform - GitHub Setup"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No estás en el directorio raíz del proyecto"
    exit 1
fi

# Verificar que git está inicializado
if [ ! -d ".git" ]; then
    echo "❌ Error: Git no está inicializado"
    echo "Ejecuta: git init"
    exit 1
fi

echo "📋 Configuración de Git"
echo "======================"
echo ""

# Pedir datos
read -p "Tu usuario de GitHub: " GITHUB_USER
read -p "Tu email de GitHub: " GITHUB_EMAIL
read -p "Nombre del repositorio (default: event-staffing-platform): " REPO_NAME
REPO_NAME=${REPO_NAME:-event-staffing-platform}

echo ""
echo "🔐 Autenticación"
echo "================"
echo ""
echo "GitHub requiere Personal Access Token (PAT)"
echo "Crear en: https://github.com/settings/tokens"
echo ""
read -sp "Pega tu Personal Access Token: " GITHUB_TOKEN
echo ""

# Configurar git
echo ""
echo "⚙️  Configurando Git..."
git config user.name "$GITHUB_USER"
git config user.email "$GITHUB_EMAIL"
git config --global credential.helper osxkeychain

# Agregar archivos
echo "📦 Agregando archivos..."
git add .

# Commit inicial
echo "💾 Creando commit inicial..."
git commit -m "feat: initial commit - event staffing platform v1.0" || true

# Cambiar rama a main
echo "🌿 Configurando rama main..."
git branch -M main

# Agregar remote
echo "🔗 Agregando remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Push
echo "🚀 Haciendo push a GitHub..."
git push -u origin main

# Crear ramas adicionales
echo "🌿 Creando ramas adicionales..."
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging

git checkout main

echo ""
echo "✅ ¡Éxito!"
echo "=========="
echo ""
echo "Tu repositorio está en:"
echo "https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "Próximos pasos:"
echo "1. Configurar protecciones de rama en GitHub"
echo "2. Agregar secrets para CI/CD"
echo "3. Elegir plataforma de deployment (Render, Railway, etc.)"
echo ""
