import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for AI caption & hashtag generation
  app.post('/api/gemini/generate-caption', async (req, res) => {
    try {
      const { topic, niche, tone, accountName, keywords } = req.body;
      if (!ai) {
        // High quality fallback generator when key is not injected or offline
        return res.json({
          caption: `🔥 Check out this incredible ${topic || 'video'}! This is an absolute game-changer. What do you guys think? Let me know in the comments below! 👇`,
          hashtags: ['#tiktokmademebuyit', '#fyp', '#viral', '#trending', `#${(niche || 'gadgets').toLowerCase().replace(/[^a-z0-9]/g, '')}`, '#musthave']
        });
      }

      const prompt = `Generate a high-converting, viral TikTok caption and 5-8 trending hashtags for the following video:
Topic/Product: ${topic || 'trending tech review'}
Niche: ${niche || 'tech'}
Tone: ${tone || 'engaging, energetic and hook-driven'}
Account Handle: ${accountName || '@dailyfinds'}
Keywords: ${keywords || 'must-have, gadgets, viral'}

Respond with ONLY a JSON object formatted as:
{
  "caption": "Your hook-first TikTok caption with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini caption generation error:', err);
      res.json({
        caption: `✨ Don't miss this one! Full review and details. Drop your thoughts below 👇`,
        hashtags: ['#fyp', '#foryou', '#viral', '#trending', '#mustwatch']
      });
    }
  });

  // Simulated Proxy test endpoint
  app.post('/api/proxy/test', (req, res) => {
    const { host } = req.body;
    const isError = host && (host.includes('error') || host.includes('invalid') || host.includes('timeout'));
    const latency = Math.floor(Math.random() * 65) + 28;
    
    if (!isError) {
      res.json({
        success: true,
        latencyMs: latency,
        exitIp: `${Math.floor(Math.random() * 120) + 60}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
        country: 'United States',
        city: 'New York'
      });
    } else {
      res.status(400).json({
        success: false,
        error: host?.includes('timeout') ? 'Connection timed out: proxy host did not respond in 5000ms' : 'Proxy authentication failed: invalid credentials'
      });
    }
  });

  // ---- Phase 1: one account = one Chrome profile, always ----
  // A profile folder is tied to ONE account id forever. Two accounts can
  // never share a folder, and one account never gets a second folder.
  // The profile folder holds the Chrome login for that account only.
  // This server never asks for, stores, or types a TikTok password.
  // Login happens by the user, by hand, inside that account's own window.
  const PHASE1_DATA = path.resolve('phase1-data.json');
  const PROFILES_DIR = path.resolve('profiles');
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  type Phase1Store = { accounts: Array<{ id: string; username: string; clientGroup: string; createdAt: string }>; profiles: Record<string, { accountId: string; username: string; profileFolder: string; createdAt: string }> };
  function loadPhase1(): Phase1Store {
    try { return JSON.parse(fs.readFileSync(PHASE1_DATA, 'utf8')) as Phase1Store; } catch { return { accounts: [], profiles: {} }; }
  }
  function savePhase1(store: Phase1Store) { fs.writeFileSync(PHASE1_DATA, JSON.stringify(store, null, 2)); }
  const openProfiles = new Map<string, ChildProcess>();
  function isProfileOpen(accountId: string) {
    const child = openProfiles.get(accountId);
    return Boolean(child && !child.killed && child.exitCode === null);
  }
  function profileFolderFor(accountId: string) {
    return path.join(PROFILES_DIR, accountId.replace(/[^a-zA-Z0-9_-]/g, '_'));
  }
  function findChrome(): string | null {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
    const candidates: string[] = [];
    if (process.platform === 'win32') {
      const pf = process.env['ProgramFiles'] || 'C:\\Program Files';
      const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
      const local = process.env.LOCALAPPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local') : '');
      candidates.push(path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      if (local) candidates.push(path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    } else {
      candidates.push('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium');
    }
    return candidates.find((p) => { try { return fs.existsSync(p); } catch { return false; } }) || null;
  }

  app.post('/api/accounts/manual', (req, res) => {
    const usernameRaw = String(req.body?.username || '').trim();
    if (!usernameRaw) return res.status(400).json({ error: 'Account ka naam likhen.' });
    const username = usernameRaw.startsWith('@') ? usernameRaw : `@${usernameRaw}`;
    const store = loadPhase1();
    if (store.accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Ye account pehle se hai. Dobara mat banayein.' });
    }
    const account = { id: `acc-${Date.now()}`, username, clientGroup: String(req.body?.clientGroup || '').trim(), createdAt: new Date().toISOString() };
    store.accounts.push(account); savePhase1(store);
    res.json(account);
  });

  app.get('/api/profiles', (_req, res) => {
    const store = loadPhase1();
    res.json(Object.values(store.profiles).map((pr) => ({ ...pr, open: isProfileOpen(pr.accountId) })));
  });

  app.post('/api/accounts/:id/profile', (req, res) => {
    const id = req.params.id;
    const store = loadPhase1();
    const existing = store.profiles[id];
    if (existing && fs.existsSync(existing.profileFolder)) {
      return res.json({ profileFolder: existing.profileFolder, alreadyExisted: true, open: isProfileOpen(id) });
    }
    const folder = profileFolderFor(id);
    fs.mkdirSync(folder, { recursive: true });
    const account = store.accounts.find((a) => a.id === id);
    store.profiles[id] = { accountId: id, username: account?.username || id, profileFolder: folder, createdAt: new Date().toISOString() };
    savePhase1(store);
    res.json({ profileFolder: folder, alreadyExisted: false, open: false });
  });

  app.post('/api/accounts/:id/open-profile', (req, res) => {
    const id = req.params.id;
    const store = loadPhase1();
    if (isProfileOpen(id)) {
      const pr = store.profiles[id];
      return res.json({ alreadyOpen: true, profileFolder: pr?.profileFolder || profileFolderFor(id), message: 'Is account ki Chrome window pehle se khuli hai. Usi window mein kaam karein, dobara mat kholein.' });
    }
    let folder = store.profiles[id]?.profileFolder;
    if (!folder || !fs.existsSync(folder)) {
      folder = profileFolderFor(id);
      fs.mkdirSync(folder, { recursive: true });
      const account = store.accounts.find((a) => a.id === id);
      store.profiles[id] = { accountId: id, username: account?.username || id, profileFolder: folder, createdAt: new Date().toISOString() };
      savePhase1(store);
    }
    const chrome = findChrome();
    if (!chrome) {
      return res.status(400).json({ error: 'Chrome nahi mila. Pehle Google Chrome install karein, phir dobara koshish karein. Profile folder ban gaya hai, login baad mein isi profile mein hoga.' });
    }
    const child = spawn(chrome, [`--user-data-dir=${folder}`, '--no-first-run', '--no-default-browser-check', 'https://www.tiktok.com/'], { detached: false, stdio: 'ignore' });
    child.on('error', () => { openProfiles.delete(id); });
    child.on('exit', () => { openProfiles.delete(id); });
    openProfiles.set(id, child);
    res.json({ alreadyOpen: false, profileFolder: folder, message: 'Chrome window khul rahi hai, sirf is account ke liye. Is window mein sirf yehi account use karein.' });
  });

  app.post('/api/accounts/:id/close-profile', (req, res) => {
    const id = req.params.id;
    const child = openProfiles.get(id);
    if (child && !child.killed) { try { child.kill(); } catch { /* ignore */ } }
    openProfiles.delete(id);
    res.json({ ok: true, message: 'Profile band karne ki koshish ki gayi hai. Agar window abhi bhi khuli hai to usko haath se band karein.' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TikTokDesk server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
