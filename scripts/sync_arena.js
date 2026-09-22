/**
 * Arena AI Leaderboard Daily Sync Script
 * Syncs the latest leaderboard rankings for Agent, Chat (Text, Search, Vision, Document),
 * Code (WebDev, Image-to-WebDev), Image (Text-to-Image, Image Edit),
 * and Video (Text-to-Video, Image-to-Video, Video Edit).
 * Run locally: `npm run sync:arena`
 * Scheduled: GitHub Action every day at 00:00 UTC (প্রতিদিন স্বয়ংক্রিয় সিংক)
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '..', 'docs', 'data', 'arena_leaderboard.json');

const SUB_CATS = [
  { parent: "agent", key: "agent", title: "Agent", desc: "Rankings across agent behavior signals", url: "https://arena.ai/leaderboard/agent" },
  { parent: "chat", key: "text", title: "Text", desc: "Rankings across text-to-text tasks and more", url: "https://arena.ai/leaderboard/text" },
  { parent: "chat", key: "search", title: "Search", desc: "Rankings across web search-integrated LLMs", url: "https://arena.ai/leaderboard/search" },
  { parent: "chat", key: "vision", title: "Vision", desc: "Rankings across multimodal visual models", url: "https://arena.ai/leaderboard/vision" },
  { parent: "chat", key: "document", title: "Document", desc: "Rankings across document analysis models", url: "https://arena.ai/leaderboard/document" },
  { parent: "code", key: "webdev", title: "WebDev", desc: "Rankings across front-end web development tasks", url: "https://arena.ai/leaderboard/code/webdev" },
  { parent: "code", key: "image-to-webdev", title: "Image-to-WebDev", desc: "Rankings across image-to-webdev generation models", url: "https://arena.ai/leaderboard/code/image-to-webdev" },
  { parent: "image", key: "text-to-image", title: "Text-to-Image", desc: "Rankings across text-to-image generation models", url: "https://arena.ai/leaderboard/text-to-image" },
  { parent: "image", key: "image-edit", title: "Image Edit", desc: "Rankings across image editing models", url: "https://arena.ai/leaderboard/image-edit" },
  { parent: "video", key: "text-to-video", title: "Text-to-Video", desc: "Rankings across text-to-video generation models", url: "https://arena.ai/leaderboard/text-to-video" },
  { parent: "video", key: "image-to-video", title: "Image-to-Video", desc: "Rankings across image-to-video generation models", url: "https://arena.ai/leaderboard/image-to-video" },
  { parent: "video", key: "video-edit", title: "Video Edit", desc: "Rankings across video editing models", url: "https://arena.ai/leaderboard/video-edit" }
];

async function fetchHtmlWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}

function parseNextJsPayload(html) {
  if (!html) return null;
  const matches = html.matchAll(/self\.__next_f\.push\(\[1,("[\s\S]*?")\]\);?/g);
  for (const m of matches) {
    try {
      const s = JSON.parse(m[1]);
      if (s.includes('"entries":') || s.includes('"rows":')) {
        const colonIdx = s.indexOf(':');
        const jsonPart = s.slice(colonIdx + 1)
          .replace(/"\$undefined"/g, 'null')
          .replace(/"\$Q[0-9a-f]+"/g, 'null')
          .replace(/"\$[0-9a-f]+:[0-9a-f]+:[0-9a-f]+"/g, 'null')
          .replace(/"\$L[0-9a-f]+"/g, '"COMP"');
        const obj = JSON.parse(jsonPart);
        const list = obj[3]?.leaderboard?.entries || obj[3]?.snapshot?.rows;
        if (list && list.length > 0) {
          return list;
        }
      }
    } catch (e) {}
  }
  return null;
}

function normalizeRows(rawList) {
  return rawList.slice(0, 25).map(item => {
    const isAgentRow = item.avgScore !== undefined;
    const name = item.modelDisplayName || item.model || item.modelKey;
    const org = item.modelOrganization || 'OpenAI';
    const license = item.license || 'Proprietary';

    let rankRange = '';
    if (item.rankSpread) {
      rankRange = `${item.rankSpread.min} ↔ ${item.rankSpread.max}`;
    } else if (item.rankLower && item.rankUpper) {
      rankRange = item.rankLower === item.rankUpper ? `${item.rankLower}` : `${item.rankLower} ↔ ${item.rankUpper}`;
    }

    let scoreDisplay = '';
    let scoreMargin = '';
    let successDisplay = '';
    let successMargin = '';
    let ratingNum = 0;

    if (isAgentRow) {
      const netVal = item.avgScore?.value || 0;
      scoreDisplay = (netVal >= 0 ? '+' : '') + (netVal * 100).toFixed(2) + '%';
      scoreMargin = item.avgScore?.ci != null ? ('±' + (item.avgScore.ci * 100).toFixed(2) + '%') : '';
      if (item.signalScores?.task_outcome_explicit != null) {
        const succVal = item.signalScores.task_outcome_explicit;
        successDisplay = (succVal >= 0 ? '+' : '') + (succVal * 100).toFixed(2) + '%';
        successMargin = item.signalCi?.task_outcome_explicit != null ? ('±' + (item.signalCi.task_outcome_explicit * 100).toFixed(2) + '%') : '';
      } else {
        successDisplay = '-';
      }
      ratingNum = Math.round(1350 + netVal * 300);
    } else {
      ratingNum = Math.round(item.rating || item.score || 1350);
      scoreDisplay = `Score: ${ratingNum}`;
      if (item.ratingUpper && item.ratingLower) {
        scoreMargin = `95% CI [${Math.round(item.ratingLower)}, ${Math.round(item.ratingUpper)}]`;
      }
      successDisplay = item.votes ? `${item.votes.toLocaleString()} votes` : 'Verified';
    }

    return {
      rank: item.rank,
      rank_range: rankRange,
      name: name,
      lab: `${org} · ${license}`.replace(/^ · | · $/g, ''),
      score: scoreDisplay,
      score_margin: scoreMargin,
      secondary: successDisplay,
      secondary_margin: successMargin,
      rating: ratingNum,
      license: license,
      status: item.rank <= 3 ? 'trending' : (item.rank <= 10 ? 'stable' : 'normal')
    };
  });
}

async function runSync() {
  console.log('🔄 Starting Arena AI Leaderboard weekly sync across 12 sub-categories...');

  let currentData = {};
  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      currentData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
    } catch (e) {}
  }

  const result = {
    updated_at: new Date().toISOString(),
    source: 'https://arena.ai/leaderboard',
    categories: currentData.categories || {
      agent: { title: 'Agent', subcategories: {} },
      chat: { title: 'Chat', subcategories: {} },
      code: { title: 'Code', subcategories: {} },
      image: { title: 'Image', subcategories: {} },
      video: { title: 'Video', subcategories: {} }
    }
  };

  for (const sc of SUB_CATS) {
    console.log(`📡 Fetching ${sc.parent.toUpperCase()} -> ${sc.title} (${sc.url})...`);
    const html = await fetchHtmlWithTimeout(sc.url);
    const rawList = parseNextJsPayload(html);

    if (rawList && rawList.length > 0) {
      console.log(` Found ${rawList.length} models for ${sc.title}. Top: ${rawList[0].modelDisplayName || rawList[0].model}`);
      result.categories[sc.parent].subcategories[sc.key] = {
        title: sc.title,
        url: sc.url,
        description: sc.desc,
        total_models: rawList.length,
        models: normalizeRows(rawList)
      };
    } else {
      console.log(`ℹ️ Retained existing snapshot for ${sc.title}`);
    }
  }

  fs.mkdirSync(path.dirname(DATA_FILE_PATH), { recursive: true });
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(result, null, 2), 'utf8');

  console.log(`\n🎉 Arena sync complete! Written to: ${DATA_FILE_PATH}`);
}

runSync().catch(err => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});
