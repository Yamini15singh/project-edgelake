#!/bin/bash

echo "🔁 Pulling latest code..."
git pull origin main

echo "🚀 Deploying Supabase Edge Functions..."

cd /Users/yaminisingh/project_edgelake/supabase || exit

# Optional: validate before deploying
npx supabase functions list

# Deploy all functions locally
for fn in functions/*; do
  if [ -d "$fn" ]; then
    fn_name=$(basename "$fn")
    echo "📦 Deploying function: $fn_name"
    npx supabase functions deploy "$fn_name" --local
  fi
done

echo "✅ Supabase functions deployed locally."
