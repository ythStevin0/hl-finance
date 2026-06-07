#!/bin/bash
# ============================================================
# HL Finance — Fase 1 Setup Script
# Jalankan: bash setup.sh
# ============================================================

set -e  # Stop kalau ada error

echo "🚀 Setting up HL Finance project..."

# 1. Create Next.js app
npx create-next-app@latest hl-finance \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd hl-finance

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  react-hook-form \
  @hookform/resolvers \
  zod \
  date-fns \
  lucide-react \
  @tanstack/react-query \
  @tanstack/react-query-devtools

# 3. Dev dependencies
npm install -D \
  @types/node

echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.local.example → .env.local dan isi dengan Supabase credentials"
echo "2. Jalankan SQL schema di Supabase SQL Editor"
echo "3. Buat 1 user di Supabase Authentication > Users"
echo "4. Run: npm run dev"
