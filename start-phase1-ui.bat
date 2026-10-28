@echo off
cd /d %~dp0
where node >nul 2>&1 || (echo Node.js nahi mila. Pehle nodejs.org se LTS install karein, phir dobara chalao. & pause & exit /b 1)
if not exist node_modules (echo Pehli dafa install ho raha hai, thora waqt lagega... & call npm install --legacy-peer-deps)
echo TikTokDesk Phase 1 (Original UI) chal raha hai...
echo Browser mein kholo: http://localhost:3000
call npm run dev
pause
