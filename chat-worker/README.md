# mehedi-chat

Cloudflare Worker behind the "Ask My AI" chat on mehedi.pro.bd.

```
browser ──POST /chat──► Worker ──► OpenAI-compatible API (Gemini now, OmniRoute later)
```

The Worker does five things:

- Keeps the API key secret. The key never reaches the browser.
- Answers only the site's own origins (`ALLOWED_ORIGINS`).
- Limits each visitor IP to 12 questions per minute.
- Caps the conversation at 8 turns and 600 characters per question.
- Grounds every answer in `docs/ai/knowledge.md`, which `scripts/build_knowledge.py` builds from the site. It is fetched from `KNOWLEDGE_URL` and cached for 10 minutes, so rebuilding the site updates the bot.

Replies stream back as OpenAI-style SSE. The model can end a reply with `[[src:/page/]]` and `[[act:cv|whatsapp|email|projects|contact]]` tags. The site turns these into source links and buttons.

If the Worker is unreachable, the chat falls back to Pollinations, and then to the built-in rule-based answers.

## Deploy

1. Get a free Gemini API key at <https://aistudio.google.com/apikey>.
2. From the repo root, run:

   ```sh
   cd chat-worker
   npx wrangler login                    # opens the browser once
   npx wrangler secret put LLM_API_KEY   # paste the Gemini key
   npx wrangler deploy                   # prints https://mehedi-chat.<subdomain>.workers.dev
   ```

3. Paste that URL into `CHAT_API_URL` in `docs/script~9e1709.js`. Bump `script~9e1709.js?v=` in `scripts/site_src/index.full.html`, then run `npm run build` and push.
4. Check it with `curl https://mehedi-chat.<subdomain>.workers.dev/health`.

## Switch to OmniRoute later

1. In `wrangler.toml`, set `LLM_BASE_URL = "https://<omniroute-host>/v1"` and set `LLM_MODEL` to the model or combo name from the OmniRoute dashboard.
2. Run `npx wrangler secret put LLM_API_KEY` with the OmniRoute key.
3. Run `npx wrangler deploy`.

Nothing changes on the site.

## Local development

Create `chat-worker/.dev.vars`. It is git-ignored.

```
LLM_API_KEY=<gemini key>
KNOWLEDGE_URL=http://localhost:8000/ai/knowledge.md
```

Then run `npm run chat:dev`, which serves the Worker on <http://localhost:8787>. In the browser console on <http://localhost:8000>, run `window.MEHEDI_CHAT_API = 'http://localhost:8787'` before opening the chat.
