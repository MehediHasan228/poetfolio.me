# mehedi-chat

Cloudflare Worker behind the "Ask My AI" chat on mehedi.pro.bd.

```
browser ──POST /chat──► Worker ──► main key ─(fails)─► free Gemini key ─(fails)─► Workers AI
```

The Worker tries its models in turn until one answers:

1. **main**: `LLM_API_KEY` on `LLM_BASE_URL` with `LLM_MODEL` (any OpenAI-compatible API: Gemini now, OmniRoute later).
2. **free**: `FREE_LLM_API_KEY`, a free-tier Gemini key, with `FREE_LLM_MODEL`. Used only when this secret is set.
3. **workers-ai**: Cloudflare's own model (`CF_AI_MODEL`, through the `AI` binding). It needs no key and is free up to a daily allowance. For this model the knowledge leaves out the People and Library details pages, and replies are capped at 400 tokens, so the allowance lasts longer.

The `X-Chat-Model` response header names the model that answered. `/health` lists the models that are set up.

The Worker also does five things:

- Keeps the API key secret. The key never reaches the browser.
- Answers only the site's own origins (`ALLOWED_ORIGINS`).
- Limits each visitor IP to 12 questions per minute.
- Caps the conversation at 8 turns and 600 characters per question.
- Grounds every answer in `docs/ai/knowledge.md`, which `scripts/build_knowledge.py` builds from the site. It is fetched from `KNOWLEDGE_URL` and cached for 10 minutes, so rebuilding the site updates the bot.

Replies stream back as OpenAI-style SSE. The model can end a reply with `[[src:/page/]]` and `[[act:cv|whatsapp|email|projects|contact]]` tags. The site turns these into source links and buttons.

If the Worker is unreachable, the chat falls back to Pollinations. Then it answers from the site's own knowledge file: it says the AI is on a break and quotes the matching lines.

## Add a free Gemini key

Gemini's free tier works only in a Google account that has never had prepaid billing in AI Studio. Keys from an account with prepaid billing return 402 when the credits run out, on every model, even in a project marked "Free tier".

1. In such an account, open <https://aistudio.google.com/apikey>. Choose **Create API key** and pick a project marked **Free tier**. Do not set up billing.
2. From the repo root, run:

   ```sh
   bash chat-worker/set-free-key.sh
   ```

   The script reads the key without showing it and tests it with Google. It saves the key as the Worker secret `FREE_LLM_API_KEY` only if Gemini answers. If not, it explains why: no credits (402), free limit reached (429), or an invalid key.

No deploy is needed. The secret applies at once.

## Deploy

1. Get a free Gemini API key at <https://aistudio.google.com/apikey>.
2. From the repo root, run:

   ```sh
   cd chat-worker
   npx wrangler login                    # opens the browser once
   npx wrangler secret put LLM_API_KEY   # paste the Gemini key
   npx wrangler deploy                   # prints https://mehedi-chat.<subdomain>.workers.dev
   ```

3. Paste that URL into `CHAT_API_URL` in `docs/script~9e1709.js`, then run `npm run build` (it stamps every page with the script's new content hash; `npm run stamp` does only that) and push.
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
