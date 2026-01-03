const API = location.origin;

const statCheckedEl = document.getElementById('stat-checked');
const statReportsEl = document.getElementById('stat-reports');

let assessedCount = 0;

async function updateStats() {
  statCheckedEl.textContent = assessedCount;
  const r = await fetch(`${API}/api/report`).then(x => x.json()).catch(() => ({ count: 0 }));
  statReportsEl.textContent = r.count || 0;
}
updateStats();

// Detect text/link
const detectForm = document.getElementById('detect-form');
const detectResult = document.getElementById('detect-result');
detectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(detectForm).entries());
  detectResult.innerHTML = 'Assessing...';

  const res = await fetch(`${API}/api/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: data.text, url: data.url })
  }).then(r => r.json()).catch(() => ({ error: 'Network error' }));

  if (res.error) {
    detectResult.innerHTML = `<span style="color: var(--danger)">${res.error}</span>`;
    return;
  }

  assessedCount++;
  updateStats();

  const signals = (res.signals || []).map(s => `<li><strong>${s.label}:</strong> +${s.weight}</li>`).join('');
  const recs = (res.recommendations || []).map(r => `<li>${r}</li>`).join('');

  detectResult.innerHTML = `
    <div><strong>Risk:</strong> ${res.risk.toUpperCase()} — <strong>Score:</strong> ${res.score}</div>
    <div style="margin-top:8px"><strong>Signals:</strong></div>
    <ul>${signals || '<li>None</li>'}</ul>
    <div style="margin-top:8px"><strong>Recommendations:</strong></div>
    <ul>${recs}</ul>
  `;
});

// Detect media upload
const mediaForm = document.getElementById('media-form');
const mediaResult = document.getElementById('media-result');
mediaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(mediaForm);
  mediaResult.innerHTML = 'Uploading...';
  const res = await fetch(`${API}/api/detect/media`, { method: 'POST', body: fd })
    .then(r => r.json()).catch(() => ({ error: 'Network error' }));

  if (res.error) {
    mediaResult.innerHTML = `<span style="color: var(--danger)">${res.error}</span>`;
    return;
  }

  assessedCount++;
  updateStats();

  const signals = (res.signals || []).map(s => `<li><strong>${s.label}:</strong> +${s.weight}</li>`).join('');
  const recs = (res.recommendations || []).map(r => `<li>${r}</li>`).join('');

  mediaResult.innerHTML = `
    <div><strong>File:</strong> ${res.filename}</div>
    <div><strong>Risk:</strong> ${res.risk.toUpperCase()} — <strong>Score:</strong> ${res.score}</div>
    <div style="margin-top:8px"><strong>Signals:</strong></div>
    <ul>${signals || '<li>None</li>'}</ul>
    <div style="margin-top:8px"><strong>Recommendations:</strong></div>
    <ul>${recs}</ul>
  `;
});

// Report form
const reportForm = document.getElementById('report-form');
const reportResult = document.getElementById('report-result');
reportForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(reportForm).entries());
  reportResult.innerHTML = 'Submitting...';

  const res = await fetch(`${API}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()).catch(() => ({ error: 'Network error' }));

  if (res.error) {
    reportResult.innerHTML = `<span style="color: var(--danger)">${res.error}</span>`;
    return;
  }

  reportResult.innerHTML = `Report submitted. <strong>ID:</strong> ${res.id}`;
  reportForm.reset();
  renderReports();
});

// Render reports
async function renderReports() {
  const list = document.getElementById('reports-list');
  list.innerHTML = 'Loading...';
  const res = await fetch(`${API}/api/report`).then(r => r.json()).catch(() => ({ count: 0, reports: [] }));
  if (!res.reports?.length) {
    list.innerHTML = '<div class="item">No reports yet.</div>';
    return;
  }
  list.innerHTML = res.reports.slice(-10).reverse().map(r => `
    <div class="item">
      <div><strong>ID:</strong> ${r.id} — <strong>Status:</strong> ${r.status}</div>
      ${r.url ? `<div><strong>URL:</strong> <a href="${r.url}" target="_blank" rel="noopener">${r.url}</a></div>` : ''}
      ${r.text ? `<div><strong>Text:</strong> ${escapeHTML(r.text).slice(0, 240)}${r.text.length > 240 ? '…' : ''}</div>` : ''}
      ${r.notes ? `<div><strong>Notes:</strong> ${escapeHTML(r.notes).slice(0, 240)}${r.notes.length > 240 ? '…' : ''}</div>` : ''}
      <div style="color: var(--muted); font-size: 12px">Submitted: ${new Date(r.createdAt).toLocaleString()}</div>
    </div>
  `).join('');
}

// Resources
async function renderResources() {
  const grid = document.getElementById('resources-grid');
  grid.innerHTML = 'Loading...';
  const res = await fetch(`${API}/api/resources`).then(r => r.json()).catch(() => ({ resources: { guides: [], tools: [] } }));
  const { guides = [], tools = [] } = res.resources || {};

  const guideCards = guides.map(g => `
    <div class="resource-card">
      <h4>${escapeHTML(g.title)}</h4>
      <p>${escapeHTML(g.summary)}</p>
      ${g.link && g.link !== '#' ? `<a href="${g.link}" target="_blank" rel="noopener">Read more</a>` : ''}
    </div>
  `).join('');

  const toolCards = tools.map(t => `
    <div class="resource-card">
      <h4>${escapeHTML(t.name)}</h4>
      <a href="${t.link}" target="_blank" rel="noopener">${t.link}</a>
    </div>
  `).join('');

  grid.innerHTML = `
    <div class="resource-card" style="grid-column: 1 / -1">
      <h4>How to use Trinetra effectively</h4>
      <p>Assess claims, check sources, and report suspicious items. Use the tools below to verify before you share.</p>
    </div>
    ${guideCards}
    ${toolCards}
  `;
}

function escapeHTML(s = '') {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

renderReports();
renderResources();