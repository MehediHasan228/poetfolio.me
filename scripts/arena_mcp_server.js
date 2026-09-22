#!/usr/bin/env node
/**
 * Model Context Protocol (MCP) Server for Arena AI Leaderboards
 * Allows Claude, Cursor, Antigravity, and AI Agents to query Arena AI rankings dynamically.
 * Implements JSON-RPC 2.0 over stdio according to the MCP specification.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, '..', 'docs', 'data', 'arena_leaderboard.json');

function getLeaderboardData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return null;
}

const TOOLS = [
  {
    name: 'get_arena_leaderboard',
    description: 'Get AI model rankings from Arena.ai across categories (agent, chat, code, image, video).',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Main category: agent, chat, code, image, video',
          enum: ['agent', 'chat', 'code', 'image', 'video'],
          default: 'agent'
        },
        subcategory: {
          type: 'string',
          description: 'Sub-category: agent, text, search, vision, document, webdev, image-to-webdev, text-to-image, image-edit, text-to-video, image-to-video, video-edit'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of models to return (default 10)',
          default: 10
        }
      }
    }
  },
  {
    name: 'list_arena_categories',
    description: 'List all available Arena.ai categories, subcategories, and model counts.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

function handleRequest(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'arena-leaderboard-mcp',
          version: '1.0.0'
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOLS
      }
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    const data = getLeaderboardData();

    if (!data) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: 'Error: Arena leaderboard data file not found.' }]
        }
      };
    }

    if (name === 'list_arena_categories') {
      const summary = [];
      for (const cat of Object.keys(data.categories || {})) {
        const subMap = data.categories[cat].subcategories || {};
        for (const sub of Object.keys(subMap)) {
          summary.push({
            category: cat,
            subcategory: sub,
            title: subMap[sub].title,
            description: subMap[sub].description,
            total_models: subMap[sub].total_models
          });
        }
      }
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }]
        }
      };
    }

    if (name === 'get_arena_leaderboard') {
      const cat = args?.category || 'agent';
      const sub = args?.subcategory || (cat === 'agent' ? 'agent' : (cat === 'chat' ? 'text' : (cat === 'code' ? 'webdev' : (cat === 'image' ? 'text-to-image' : 'text-to-video'))));
      const limit = args?.limit || 10;

      const subcatData = data.categories?.[cat]?.subcategories?.[sub];
      if (!subcatData) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Category "${cat}" or subcategory "${sub}" not found.` }]
          }
        };
      }

      const response = {
        updated_at: data.updated_at,
        category: cat,
        subcategory: sub,
        title: subcatData.title,
        description: subcatData.description,
        total_models: subcatData.total_models,
        top_models: (subcatData.models || []).slice(0, limit)
      };

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
        }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const res = handleRequest(req);
    if (res) {
      console.log(JSON.stringify(res));
    }
  } catch (err) {
    console.error('Error processing line:', err.message);
  }
});
