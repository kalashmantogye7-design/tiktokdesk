# TikTokDesk — Workable version (v1)

Frontend: same UI as the Google Drive / Google AI Studio export (16 screens).
Backend in this folder: Express server from the original export, plus the
verified-publish fix described below. This is a manager / planner, not yet a
real TikTok auto-publisher.

## v1.1 fix — white screen on empty data (2026-10-28)

Cause: Extension, Metadata and Session Timer screens read the first
account (`accounts[0]`) and then used its username/photo without
checking it exists. With demo data removed, that account is undefined,
so React crashed and the whole main area went blank white.

Fix: those screens now show a "No account yet" message instead of
crashing, handler buttons guard against a missing account, Video
Library handlers do the same, and a new ErrorBoundary wraps every
screen so a future screen error shows a message instead of a white
page (sidebar navigation still works). Build + `tsc` lint pass.
Note: the in-VM browser check could not open the local test address
(tool rejected localhost), so this fix is verified by build/lint and
by the code paths above — please confirm on your own PC at
http://localhost:3000 after updating (see below).

## What changed from the demo (2026-10-28)

- All demo data removed: clients, accounts, videos, templates, queue,
  schedules, proxies, extensions, errors and backups now start empty.
  Add your own data from the UI. Data persists in the browser
  (localStorage, keys `tiktokdesk_*`).
- Hardcoded demo activity, demo folder paths and fake engagement numbers
  removed.
- Fake publishing removed: the queue no longer invents a TikTok URL and
  never auto-marks a task as Published. A task stops at Verification.
  Publish the video on TikTok yourself, then paste the real post link in
  Publishing Queue → Verification required → Confirm Published.
  Only then does the task become Published, and only then can a video
  move to Uploaded when ALL its assigned accounts are verified
  (the PDF's archive rule).

## How to run (local)

1. `npm install --legacy-peer-deps` (plain `npm install` hits a
   peer-dependency conflict in the original export)
2. `npm run dev` — Express + Vite on port 3000 by default
3. Or build only the frontend: `npm run build` (output in `dist/`)

Optional: set `GEMINI_API_KEY` in `.env.local` for real AI captions.
Without a key, the server returns a generic fallback caption.

## What is still NOT real in this web version

- Real TikTok upload / auto-publish: needs TikTok's official Content
  Posting API + a developer app + per-account OAuth + approval. That is
  the next track, not in this v1.
- Dedicated Windows browser profiles, `D:\TikTok\...` folder scanning,
  and a real TikTok session inside the app: those need a Windows desktop
  app, not a cloud website. The Mobile Browser screen here is a preview
  UI, not a real TikTok browser.
- Proxy test (`/api/proxy/test`): still simulated in the original
  server code. Do not treat its latency / IP as a real proxy check.
- Team sharing: localStorage is per-browser. A shared database is
  needed before this works as a multi-user agency system.

## PDF spec used

`TikTokDesk_Dashboard_Infographic_Mockup_compressed.pdf` (95 pages,
uploaded 2026-10-28) — text verified identical to the PDF inside the
original zip. Images in the PDF were ignored; the written functions
for the 16 screens are the spec. The PDF itself says implementation
was pending for every screen, so this v1 implements the manager
functions (CRUD, scheduling, queue, verification, archive rule,
reports, backup) and leaves real TikTok publishing / desktop profiles
for the next track.
