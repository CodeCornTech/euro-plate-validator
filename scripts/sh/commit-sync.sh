#!/usr/bin/env bash
# ------------------------------------------------------------
# 🌽 CodeCorn - Commit & Sync Helper for Node Packages
# ------------------------------------------------------------
# Esegue build, commit, push, bump e publish npm opzionale.
# Usa: ./commit-sync.sh [--publish]
# ------------------------------------------------------------

set -e # stop on error

# --- 1️⃣ Messaggio di commit ---
echo "📝 Inserisci messaggio di commit:"
read -r COMMIT_MSG
if [[ -z "$COMMIT_MSG" ]]; then
    echo "❌ Commit message obbligatorio."
    exit 1
fi

# --- 2️⃣ Build progetto ---
echo "⚙️  Avvio build..."
npm run build || {
    echo "❌ Build fallita."
    exit 1
}

# --- 3️⃣ Git commit + push ---
echo "📦 Aggiungo modifiche al commit..."
git add -A
git commit -m "$COMMIT_MSG" || echo "⚠️  Nessuna modifica da committare."

echo "🚀 Pushing branch + tag..."
git push
git push --tags || true

# --- 4️⃣ Chiedi se vuoi bumpare la versione ---
echo
read -rp "🔢 Vuoi bumpare la versione npm? (y/N) " bump
if [[ "$bump" =~ ^[Yy]$ ]]; then
    read -rp "➡️  Tipo di bump (patch/minor/major): " bump_type
    bump_type="${bump_type:-patch}"
    npm version "$bump_type" -m "chore(release): v%s – $COMMIT_MSG"
    git push && git push --tags
fi

# --- 5️⃣ Pubblicazione npm (opzionale) ---
if [[ "$1" == "--publish" ]]; then
    echo
    echo "📤 Pubblicazione su npm..."
    npm publish --access public || echo "⚠️  Publish fallito o versione già esistente."
else
    echo "🏁 Salta publish (puoi farlo con: npm publish --access public)"
fi

echo
echo "✅ Tutto sincronizzato con successo."
