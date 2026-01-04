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

Deploying the backend for the live site
-------------------------------------

The frontend is static (served on GitHub Pages). Detection and reporting features call the backend API — you must host the backend to make those features work on the live site.

1) Deploy backend (example platforms):
	- Render.com / Railway.app / Fly.io — deploy `backend/server.js` as a Node service. Set `PORT` as required.
	- Or host on any VM or PaaS and expose HTTPS.

2) Configure the frontend to call your backend
	- Edit `frontend/index.html` and add this before the `<script src="app.js"></script>` line:

```html
<script>
	// replace with your backend URL, e.g. https://api.example.com
	window.__TRINETRA_API__ = 'https://your-backend.example.com';
</script>
```

	- Then redeploy the `frontend` folder to GitHub Pages (or push to your hosting) so the static site points to the hosted API.

3) Redeploy frontend (from project root):
```bash
npx gh-pages -d frontend -r https://github.com/your-username/trinetra.git
```

If you cannot host the backend yet, the site will still display UI but detection/report actions will show a friendly notice explaining the backend is not configured.
