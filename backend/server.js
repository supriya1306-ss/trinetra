import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Ensure uploads directory exists for multer
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Load resources
const resourcesPath = path.join(process.cwd(), 'backend', 'resources.json');
let resources = { guides: [], tools: [] };
try {
  resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
} catch (err) {
  console.warn('Could not load resources.json at', resourcesPath, err.message);
}

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Trinetra' }));

// Detect (stub): text or URL analysis
app.post('/api/detect', async (req, res) => {
  const { text, url } = req.body || {};

  // Simple heuristic scoring stub (replace with real model later)
  const signals = [];
  let score = 0;

  function addSignal(label, weight) {
    signals.push({ label, weight });
    score += weight;
  }

  if (text) {
    const t = text.toLowerCase();
    if (t.length < 30) addSignal('Very short claim', 0.15);
    if ((t.match(/!/g) || []).length >= 3) addSignal('Sensational punctuation', 0.2);
    if (/(shocking|secret|exposed|you won’t believe)/.test(t)) addSignal('Clickbait phrasing', 0.25);
    if (!/[a-z]{3,}\s[a-z]{3,}/.test(t)) addSignal('Low linguistic richness', 0.1);
    if (/forward this|share now/.test(t)) addSignal('Virality nudge', 0.2);
  }

  if (url) {
    try {
      const host = new URL(url).hostname;
      if (/\.blogspot|\.wordpress|medium\.com/.test(host)) addSignal('Unverified host', 0.1);
      if (!/\.(?:gov|edu|org|in)$/.test(host)) addSignal('Not an authority domain', 0.1);
    } catch {
      addSignal('Malformed URL', 0.2);
    }
  }

  // Normalize score to risk bands
  const risk =
    score >= 0.6 ? 'high' :
    score >= 0.3 ? 'medium' :
    'low';

  res.json({
    risk,
    score: Number(score.toFixed(2)),
    signals,
    recommendations: [
      'Cross-check with at least two reputable sources.',
      'Look for original source, date, and author credentials.',
      'Beware of sensational language and unverifiable claims.'
    ]
  });
});

// Detect media (stub): image/video upload for placeholder analysis
app.post('/api/detect/media', upload.single('file'), async (req, res) => {
  // In a real system, run deepfake/media forensics here
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  // Simple placeholder response
  res.json({
    filename: file.originalname,
    risk: 'medium',
    score: 0.45,
    signals: [
      { label: 'Unknown provenance', weight: 0.2 },
      { label: 'No embedded metadata check', weight: 0.25 }
    ],
    recommendations: [
      'Request original, uncompressed source file.',
      'Check for content provenance (C2PA, watermark).',
      'Verify with trusted reporting before sharing.'
    ]
  });
});

// Report content for review (stores minimal info in memory)
const reports = [];
app.post('/api/report', (req, res) => {
  const { text, url, notes, contact } = req.body || {};
  const id = `R-${Date.now()}`;
  reports.push({ id, text, url, notes, contact, createdAt: new Date().toISOString(), status: 'received' });
  res.json({ id, status: 'received' });
});

app.get('/api/report', (req, res) => {
  res.json({ count: reports.length, reports });
});

// Resources
app.get('/api/resources', (req, res) => {
  res.json({ resources });
});

// Serve frontend static files from the `frontend` folder
app.use('/', express.static(path.join(process.cwd(), 'frontend')));

app.listen(PORT, () => {
  console.log(`Trinetra server running at http://localhost:${PORT}`);
});