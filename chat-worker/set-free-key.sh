#!/usr/bin/env bash
# Adds a free-tier Gemini key to the chat Worker as the secret FREE_LLM_API_KEY, once a test call shows it answers.
# The key is read without echoing, never written to a file, and sent only to Google (the test) and Cloudflare.
#   bash chat-worker/set-free-key.sh
set -euo pipefail
cd "$(dirname "$0")"

read -rsp "Paste the free Gemini API key (it stays hidden), then Enter: " KEY
echo
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[ -n "$KEY" ] || { echo "No key given."; exit 1; }

MODEL="$(sed -n 's/^FREE_LLM_MODEL = "\(.*\)"/\1/p' wrangler.toml)"
MODEL="${MODEL:-gemini-flash-latest}"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

echo "Checking the key with $MODEL ..."
CODE="$(curl -s -m 60 -o "$OUT" -w '%{http_code}' \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -H 'Content-Type: application/json' -H "X-goog-api-key: ${KEY}" \
  -d '{"contents":[{"parts":[{"text":"Reply with just: OK"}]}]}' || true)"

case "$CODE" in
  200)
    echo "The key works. Adding it to the Worker ..."
    printf '%s' "$KEY" | npx wrangler secret put FREE_LLM_API_KEY
    echo "Done. The chat now tries this key when the main one fails. Check: curl https://mehedi-chat.rajnieem.workers.dev/health"
    ;;
  402)
    echo "Not added: Google says this account's prepaid credits are spent (402)."
    echo "Keys from a Google account with prepaid billing are not free. Make the key in a Google account that has never"
    echo "had billing set up in AI Studio, in a project marked \"Free tier\"."
    exit 2
    ;;
  429)
    echo "Not added: the key is valid but its free limit is used up for now (429). Try again later or tomorrow."
    exit 3
    ;;
  400|401|403)
    echo "Not added: Google rejected the key ($CODE). Copy it again from https://aistudio.google.com/apikey."
    exit 4
    ;;
  *)
    echo "Not added: unexpected answer from Google (HTTP $CODE):"
    head -c 300 "$OUT"; echo
    exit 5
    ;;
esac
