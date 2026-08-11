# Chain Assistant Bot

A modular, conversational Telegram blockchain assistant. Built incrementally,
phase by phase - see `docs/` for the design log of each milestone.

## Phase 0 status
Bot boots, connects to Telegram, and responds to `/start`. Nothing else yet -
that's intentional. See `docs/phase-0-foundations.md`.

## Local setup
```bash
npm install
cp .env.example .env
# edit .env and set BOT_TOKEN from @BotFather
npm run dev
```
Open Telegram, message your bot, send `/start`.

## Push to GitHub
```bash
git init
git add .
git commit -m "Phase 0: project foundations"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deploy (Railway)
1. railway.app → New Project → Deploy from GitHub repo → select this repo
2. Add environment variables (BOT_TOKEN, NODE_ENV=production, LOG_LEVEL=info)
   in Railway's Variables tab
3. Railway auto-detects Node, runs `npm install` and `npm start` after `npm run build`
   - set the build command to `npm run build` and start command to `npm start`
     in Railway's settings if it doesn't infer them automatically
4. Every push to `main` redeploys automatically
