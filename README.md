# Trinetra — Fight Disinformation & Deepfakes

Minimal demo app (Express backend + static frontend) for experimenting with lightweight heuristics and manual reporting.

Quick start (Windows)

1. Install dependencies:

```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\trinetra"
npm install
```

If PowerShell blocks `npm` scripts, run in Command Prompt or set ExecutionPolicy for your user:

```powershell
# one-time bypass
powershell -ExecutionPolicy Bypass -Command "npm install"

# or allow local scripts for current user
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

2. Run the server:

```powershell
npm run dev
# then open http://localhost:3000
```

Project layout

- `backend/` — Express server and API
- `frontend/` — static site served by the backend
- `frontend/assets/` — images (logo.png) and other static assets

Replace `frontend/assets/logo.png` with your logo image to show your branding.

License: MIT (change as desired)
