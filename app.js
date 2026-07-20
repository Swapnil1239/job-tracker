/* CareerFlow AI - Robust Bulletproof Gemini AI Integration with Diagnostic Testing */

const STORAGE_KEY = 'careerflow_jobs_data';
const PROFILE_KEY = 'careerflow_profile_data';

// Application State
let jobs = [];
let profile = {
  name: 'Alex Vance',
  contact: 'alex.vance@example.com | (555) 019-2831',
  linkedin: 'https://linkedin.com/in/alexvance-dev',
  portfolio: 'https://github.com/alexvance-code',
  summary: 'Full-stack software engineer with 5+ years of experience building high-performance web applications, cloud microservices, and slick user interfaces with React, Node.js, and TypeScript.',
  pitch: 'I excel at bringing ambitious products from zero to one. Passionate about system design, frontend performance, and delivering memorable developer and end-user experiences.',
  geminiApiKey: ''
};

let currentTab = 'kanban';
let currentSearch = '';
let statusChart = null;
let timelineChart = null;

// Initial Default Sample Data
const DEFAULT_JOBS = [
  {
    id: 'job_101',
    company: 'Vercel',
    position: 'Senior Frontend Engineer',
    status: 'Offered',
    workMode: 'Remote',
    salary: '$165,000 - $190,000',
    url: 'https://vercel.com/careers',
    location: 'San Francisco, CA (Remote)',
    dateApplied: '2026-06-25',
    followUpDate: '2026-07-22',
    contact: 'Elena Rostova (Recruiting Manager)',
    notes: 'Completed 4 rounds of interviews including system design & pair programming. Team was super friendly. Offer received on July 18th!'
  },
  {
    id: 'job_102',
    company: 'Stripe',
    position: 'Staff Software Engineer - Dashboard',
    status: 'Interviewing',
    workMode: 'Hybrid',
    salary: '$180,000 - $215,000',
    url: 'https://stripe.com/jobs',
    location: 'Seattle, WA',
    dateApplied: '2026-07-02',
    followUpDate: '2026-07-21',
    contact: 'Marcus Vance (Technical Recruiter)',
    notes: 'Initial recruiter screen completed. Onsite technical interview scheduled for next Tuesday. Focus on API design and payment processing resilience.'
  },
  {
    id: 'job_103',
    company: 'Airbnb',
    position: 'Full Stack Engineer - Host Systems',
    status: 'Screening',
    workMode: 'Remote',
    salary: '$150,000 - $180,000',
    url: 'https://careers.airbnb.com',
    location: 'Remote',
    dateApplied: '2026-07-10',
    followUpDate: '2026-07-23',
    contact: 'Jordan Lee (Talent Acquisition)',
    notes: 'Submitted customized resume and referral from Chris. Waiting for recruiter screen confirmation.'
  },
  {
    id: 'job_104',
    company: 'OpenAI',
    position: 'AI Applications Engineer',
    status: 'Applied',
    workMode: 'Onsite',
    salary: '$190,000 - $240,000',
    url: 'https://openai.com/careers',
    location: 'San Francisco, CA',
    dateApplied: '2026-07-14',
    followUpDate: '2026-07-24',
    contact: 'Recruiting Team',
    notes: 'Applied with cover letter focusing on AI agent workflows and LLM tool integrations.'
  },
  {
    id: 'job_105',
    company: 'Figma',
    position: 'Product Engineer - Canvas UI',
    status: 'Applied',
    workMode: 'Hybrid',
    salary: '$160,000 - $185,000',
    url: 'https://figma.com/careers',
    location: 'San Francisco, CA',
    dateApplied: '2026-07-16',
    followUpDate: '2026-07-25',
    contact: 'Careers Portal',
    notes: 'Highlighted WebGL and canvas rendering experience in application response.'
  },
  {
    id: 'job_106',
    company: 'Linear',
    position: 'Senior Systems Engineer',
    status: 'Wishlist',
    workMode: 'Remote',
    salary: '$170,000 - $200,000',
    url: 'https://linear.app/careers',
    location: 'Remote (US/EU)',
    dateApplied: '',
    followUpDate: '',
    contact: '',
    notes: 'Love their product design and speed. Need to tweak resume to highlight local-first synchronization engine work before applying.'
  },
  {
    id: 'job_107',
    company: 'Datadog',
    position: 'Frontend Systems Architect',
    status: 'Rejected',
    workMode: 'Remote',
    salary: '$155,000 - $175,000',
    url: 'https://datadoghq.com/careers',
    location: 'New York, NY',
    dateApplied: '2026-06-10',
    followUpDate: '',
    contact: 'Dave Miller',
    notes: 'Position filled internally. Received standard polite rejection note on June 28.'
  }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromBackend();
  setupEventListeners();
  updateBookmarkletSnippet();
});

// State Persistence & Synchronization
async function loadDataFromBackend() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        jobs = data.jobs;
      } else {
        jobs = [...DEFAULT_JOBS];
      }
      if (data.profile) {
        profile = { ...profile, ...data.profile };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      loadStoredDataLocalOnly();
    }
  } catch (e) {
    loadStoredDataLocalOnly();
  }

  updateProfileDOM();
  renderCurrentView();
}

function loadStoredDataLocalOnly() {
  const savedJobs = localStorage.getItem(STORAGE_KEY);
  if (savedJobs) {
    try { jobs = JSON.parse(savedJobs); } catch (e) { jobs = [...DEFAULT_JOBS]; }
  } else {
    jobs = [...DEFAULT_JOBS];
  }

  const savedProfile = localStorage.getItem(PROFILE_KEY);
  if (savedProfile) {
    try { profile = { ...profile, ...JSON.parse(savedProfile) }; } catch (e) {}
  }
}

async function syncDataToBackend() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  renderCurrentView();

  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs, profile })
    });
  } catch (err) {
    console.warn('Offline mode: Saved locally in browser.');
  }
}

function saveJobsData() {
  syncDataToBackend();
}

function saveProfileData() {
  syncDataToBackend();
  updateProfileDOM();
}

function loadSampleData() {
  if (confirm("Reset application tracker with rich sample data? Custom applications will be replaced.")) {
    jobs = [...DEFAULT_JOBS];
    saveJobsData();
    showToast("Sample job applications loaded!");
  }
}

// Profile DOM Binding
function updateProfileDOM() {
  document.getElementById('snippet-name-val').textContent = profile.name || 'Your Name';
  document.getElementById('snippet-contact-val').textContent = profile.contact || 'Email / Phone';
  document.getElementById('snippet-linkedin-val').textContent = profile.linkedin || 'LinkedIn URL';
  document.getElementById('snippet-portfolio-val').textContent = profile.portfolio || 'Portfolio URL';
  document.getElementById('snippet-summary-val').textContent = profile.summary || 'Summary...';
  document.getElementById('snippet-pitch-val').textContent = profile.pitch || 'Pitch...';

  document.getElementById('prof-name').value = profile.name || '';
  document.getElementById('prof-contact').value = profile.contact || '';
  document.getElementById('prof-linkedin').value = profile.linkedin || '';
  document.getElementById('prof-portfolio').value = profile.portfolio || '';
  document.getElementById('prof-summary').value = profile.summary || '';
  document.getElementById('prof-pitch').value = profile.pitch || '';
  document.getElementById('prof-gemini-key').value = profile.geminiApiKey || '';

  const badge = document.getElementById('gemini-key-status-text');
  if (badge) {
    if (profile.geminiApiKey) {
      badge.textContent = 'Gemini AI: Configured ✨';
      badge.className = 'text-xs font-bold text-emerald-400';
    } else {
      badge.textContent = 'Add Gemini Key 🔑';
      badge.className = 'text-xs font-bold text-amber-400';
    }
  }
}

// Event Listeners Setup
function setupEventListeners() {
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderCurrentView();
    });
  }
}

// Tab Switching Navigation
function switchTab(tabName) {
  currentTab = tabName;
  const tabs = ['kanban', 'dashboard', 'table', 'faster'];
  
  tabs.forEach(tab => {
    const section = document.getElementById(`view-${tab}`);
    const btn = document.getElementById(`tab-${tab}`);
    
    if (tab === tabName) {
      section.classList.remove('hidden');
      btn.classList.add('text-indigo-400', 'bg-slate-800/90', 'shadow');
      btn.classList.remove('text-slate-400');
    } else {
      section.classList.add('hidden');
      btn.classList.remove('text-indigo-400', 'bg-slate-800/90', 'shadow');
      btn.classList.add('text-slate-400');
    }
  });

  renderCurrentView();
}

// Filter Logic
function getFilteredJobs() {
  const workModeFilter = document.getElementById('filter-work-mode')?.value || 'ALL';

  return jobs.filter(job => {
    if (workModeFilter !== 'ALL' && job.workMode !== workModeFilter) {
      return false;
    }

    if (currentSearch) {
      const matchCompany = job.company?.toLowerCase().includes(currentSearch);
      const matchPosition = job.position?.toLowerCase().includes(currentSearch);
      const matchStatus = job.status?.toLowerCase().includes(currentSearch);
      const matchNotes = job.notes?.toLowerCase().includes(currentSearch);
      const matchLocation = job.location?.toLowerCase().includes(currentSearch);

      return matchCompany || matchPosition || matchStatus || matchNotes || matchLocation;
    }

    return true;
  });
}

// Main Render Hub
function renderCurrentView() {
  const filtered = getFilteredJobs();
  checkFollowUpReminders();

  if (currentTab === 'kanban') {
    renderKanbanBoard(filtered);
  } else if (currentTab === 'dashboard') {
    renderDashboardMetrics(filtered);
    renderDashboardCharts(filtered);
  } else if (currentTab === 'table') {
    renderTable(filtered);
  }
}

// 1. KANBAN BOARD RENDER & DRAG & DROP
function renderKanbanBoard(filteredJobs) {
  const columns = ['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'];

  columns.forEach(col => {
    const colContainer = document.getElementById(`col-${col}`);
    const countBadge = document.getElementById(`count-${col}`);
    
    if (!colContainer) return;
    
    const colJobs = filteredJobs.filter(j => j.status === col);
    if (countBadge) countBadge.textContent = colJobs.length;

    colContainer.innerHTML = '';

    if (colJobs.length === 0) {
      colContainer.innerHTML = `
        <div class="h-24 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs font-medium">
          No applications
        </div>
      `;
      return;
    }

    colJobs.forEach(job => {
      const isUrgent = isFollowUpDue(job);
      const card = document.createElement('div');
      card.className = `kanban-card glass-card p-4 rounded-xl space-y-2.5 border border-slate-800 text-xs shadow-sm transition-all ${isUrgent ? 'urgent-followup' : ''}`;
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', job.id);
      
      card.addEventListener('dragstart', (e) => handleDragStart(e, job.id));
      card.addEventListener('dragend', handleDragEnd);

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-bold text-slate-100 text-sm hover:text-indigo-400 cursor-pointer" onclick="openJobDetailModal('${job.id}')">${escapeHTML(job.company)}</h4>
            <p class="text-slate-300 font-medium line-clamp-1">${escapeHTML(job.position)}</p>
          </div>
          <button onclick="openJobDetailModal('${job.id}')" class="text-slate-400 hover:text-slate-200">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">${escapeHTML(job.workMode || 'Remote')}</span>
          ${job.salary ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${escapeHTML(job.salary)}</span>` : ''}
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 mt-2">
          <span>${job.dateApplied ? `<i class="fa-regular fa-calendar mr-1"></i>${job.dateApplied}` : 'Not applied'}</span>
          ${isUrgent ? `<span class="text-amber-400 font-semibold"><i class="fa-solid fa-bell mr-1"></i>Follow Up</span>` : ''}
        </div>
      `;

      colContainer.appendChild(card);
    });
  });
}

// Drag & Drop Handlers
let draggedJobId = null;

function handleDragStart(e, jobId) {
  draggedJobId = jobId;
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', jobId);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  const col = e.currentTarget;
  col.classList.add('drag-over');
}

function handleDragLeave(e) {
  const col = e.currentTarget;
  col.classList.remove('drag-over');
}

function handleDrop(e, targetStatus) {
  e.preventDefault();
  const col = e.currentTarget;
  col.classList.remove('drag-over');

  if (draggedJobId) {
    const job = jobs.find(j => j.id === draggedJobId);
    if (job && job.status !== targetStatus) {
      job.status = targetStatus;
      if (targetStatus === 'Applied' && !job.dateApplied) {
        job.dateApplied = new Date().toISOString().split('T')[0];
      }
      saveJobsData();
      showToast(`Updated ${job.company} status to ${targetStatus}`);
    }
  }
}

// 2. DASHBOARD METRICS & CHARTS
function renderDashboardMetrics(filteredJobs) {
  const total = filteredJobs.length;
  const interviewing = filteredJobs.filter(j => j.status === 'Screening' || j.status === 'Interviewing').length;
  const offers = filteredJobs.filter(j => j.status === 'Offered').length;
  
  const interviewRate = total > 0 ? Math.round((interviewing + offers) / total * 100) : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-interview-rate').textContent = `${interviewRate}%`;
  document.getElementById('stat-offers').textContent = offers;

  const appliedThisMonth = filteredJobs.filter(j => j.status !== 'Wishlist').length;
  const target = 10;
  document.getElementById('stat-weekly-progress').textContent = `${appliedThisMonth} / ${target}`;
  
  const pct = Math.min(Math.round((appliedThisMonth / target) * 100), 100);
  document.getElementById('weekly-goal-bar').style.width = `${pct}%`;
}

function renderDashboardCharts(filteredJobs) {
  const ctxStatus = document.getElementById('chart-status');
  if (ctxStatus) {
    const statusCounts = {
      'Wishlist': filteredJobs.filter(j => j.status === 'Wishlist').length,
      'Applied': filteredJobs.filter(j => j.status === 'Applied').length,
      'Screening': filteredJobs.filter(j => j.status === 'Screening').length,
      'Interviewing': filteredJobs.filter(j => j.status === 'Interviewing').length,
      'Offered': filteredJobs.filter(j => j.status === 'Offered').length,
      'Rejected': filteredJobs.filter(j => j.status === 'Rejected').length,
    };

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#94a3b8', '#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#ef4444'
          ],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', font: { size: 11, family: 'Plus Jakarta Sans' } }
          }
        },
        cutout: '70%'
      }
    });
  }

  const ctxTimeline = document.getElementById('chart-timeline');
  if (ctxTimeline) {
    const dates = {};
    filteredJobs.forEach(job => {
      if (job.dateApplied) {
        dates[job.dateApplied] = (dates[job.dateApplied] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dates).sort();
    const counts = sortedDates.map(d => dates[d]);

    if (timelineChart) timelineChart.destroy();

    timelineChart = new Chart(ctxTimeline, {
      type: 'bar',
      data: {
        labels: sortedDates.length > 0 ? sortedDates : ['No Data'],
        datasets: [{
          label: 'Applications Submitted',
          data: counts.length > 0 ? counts : [0],
          backgroundColor: '#6366f1',
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// 3. APPLICATIONS TABLE VIEW
function renderTable(filteredJobs) {
  const tableBody = document.getElementById('table-body');
  const tableStatusFilter = document.getElementById('table-filter-status')?.value || 'ALL';

  if (!tableBody) return;

  const displayJobs = (filteredJobs || getFilteredJobs()).filter(j => {
    return tableStatusFilter === 'ALL' || j.status === tableStatusFilter;
  });

  tableBody.innerHTML = '';

  if (displayJobs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-500">
          No matching applications found.
        </td>
      </tr>
    `;
    return;
  }

  displayJobs.forEach(job => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/50 transition-colors';
    
    const badgeClass = getBadgeClass(job.status);
    const isUrgent = isFollowUpDue(job);

    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="font-bold text-slate-100 cursor-pointer hover:text-indigo-400" onclick="openJobDetailModal('${job.id}')">${escapeHTML(job.company)}</div>
        <div class="text-slate-400 text-[11px]">${escapeHTML(job.position)}</div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}">${escapeHTML(job.status)}</span>
      </td>
      <td class="py-3 px-4">
        <div>${escapeHTML(job.workMode || 'Remote')}</div>
        <div class="text-slate-400 text-[11px]">${escapeHTML(job.location || '-')}</div>
      </td>
      <td class="py-3 px-4 font-mono text-emerald-400 font-medium">
        ${escapeHTML(job.salary || '-')}
      </td>
      <td class="py-3 px-4 text-slate-400">
        ${job.dateApplied || '-'}
      </td>
      <td class="py-3 px-4">
        ${isUrgent ? `<span class="text-amber-400 font-bold flex items-center gap-1"><i class="fa-solid fa-bell"></i> Action Due</span>` : (job.followUpDate || '-')}
      </td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="openJobDetailModal('${job.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="View details">
            <i class="fa-solid fa-eye text-xs"></i>
          </button>
          <button onclick="openEditJobModal('${job.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 transition" title="Edit">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// 4. APPLY FASTER HUB & DIAGNOSTIC GEMINI AI CALL ENGINE
function copySnippet(elementId, label) {
  const el = document.getElementById(elementId);
  if (el) {
    copyToClipboard(el.textContent.trim(), label);
  }
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied ${label} to clipboard!`);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// Test Key Diagnostic Helper
async function testGeminiApiKey() {
  const keyInput = document.getElementById('prof-gemini-key').value.trim();
  const resElem = document.getElementById('gemini-test-result');
  if (!resElem) return;

  resElem.classList.remove('hidden');

  if (!keyInput) {
    resElem.className = 'text-[11px] text-amber-400 font-bold mt-1';
    resElem.textContent = 'Please paste a key first.';
    return;
  }

  resElem.className = 'text-[11px] text-purple-300 font-bold mt-1 animate-pulse';
  resElem.textContent = 'Testing key against Google AI Studio...';

  // Test endpoints
  const endpointsToTest = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyInput}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${keyInput}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyInput}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${keyInput}`
  ];

  for (const url of endpointsToTest) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK' }] }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]) {
        resElem.className = 'text-[11px] text-emerald-400 font-bold mt-1';
        resElem.textContent = '✅ Success! Your Gemini API key is active & working!';
        return;
      } else if (data.error) {
        if (data.error.message.includes('API key not valid')) {
          resElem.className = 'text-[11px] text-rose-400 font-bold mt-1';
          resElem.textContent = '❌ Invalid Key: Google says this API key is not valid.';
          return;
        }
      }
    } catch (e) {}
  }

  resElem.className = 'text-[11px] text-rose-400 font-bold mt-1';
  resElem.textContent = '❌ Connection failed. Check key at https://aistudio.google.com/app/apikey';
}

async function generateAIText(type) {
  const company = document.getElementById('ai-company').value.trim() || 'Target Company';
  const position = document.getElementById('ai-position').value.trim() || 'Software Engineer';
  const jd = document.getElementById('ai-jd').value.trim();
  const tone = document.getElementById('ai-tone').value;

  const outputContainer = document.getElementById('ai-output-container');
  const outputTitle = document.getElementById('ai-output-title');
  const outputText = document.getElementById('ai-output-text');
  const btnCl = document.getElementById('btn-generate-cl');
  const btnEmail = document.getElementById('btn-generate-email');

  outputContainer.classList.remove('hidden');

  const apiKey = profile.geminiApiKey ? profile.geminiApiKey.trim() : '';

  if (apiKey) {
    const activeBtn = type === 'cover-letter' ? btnCl : btnEmail;
    const originalText = activeBtn.innerHTML;
    activeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-pink-400"></i> Thinking with Gemini...`;
    activeBtn.disabled = true;

    outputTitle.innerHTML = `<i class="fa-solid fa-sparkles text-pink-400 animate-pulse"></i> Gemini AI ${type === 'cover-letter' ? 'Cover Letter' : 'Cold Email'} (${tone})`;
    outputText.textContent = 'Connecting to Google Gemini AI...';

    const systemPrompt = type === 'cover-letter' 
      ? `You are an expert career strategist and executive resume writer. Write a compelling, highly customized Cover Letter for ${profile.name} applying for the ${position} role at ${company}.\n\nTone: ${tone}.\nCandidate Summary: ${profile.summary}\nElevator Pitch: ${profile.pitch}\nContact: ${profile.contact} | ${profile.linkedin}\n\nJob Requirements:\n${jd || 'Standard industry requirements for this role.'}\n\nInstructions: Make it modern, direct, impactful, and ready to send. Do not include markdown code blocks or meta commentary.`
      : `You are an expert recruiter and headhunter. Write a concise, powerful Cold Outreach Email from ${profile.name} to the hiring manager or recruiter at ${company} for the ${position} position.\n\nTone: ${tone}.\nCandidate Summary: ${profile.summary}\nPortfolio: ${profile.portfolio}\nContact: ${profile.contact}\nJob Context: ${jd || 'Interested in open opportunities'}\n\nInstructions: Write a high-converting email subject line and body. Ready to copy and paste.`;

    // Multi-version & Multi-model endpoints to test
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    ];

    let success = false;
    let primaryErrorMsg = '';

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const generatedText = data.candidates[0].content.parts[0].text;
          outputText.textContent = generatedText;
          showToast(`Generated via Gemini AI!`);
          success = true;
          break;
        } else if (data.error) {
          if (i === 0) primaryErrorMsg = data.error.message;
        }
      } catch (err) {
        if (i === 0) primaryErrorMsg = err.message;
      }
    }

    if (!success) {
      outputText.textContent = `Gemini API Diagnostic Note:\n${primaryErrorMsg || 'API Key validation issue'}\n\n💡 How to resolve:\n1. Open https://aistudio.google.com/app/apikey\n2. Click "Create API key"\n3. Paste your fresh key into Profile Settings and click "Test Key".`;
      showToast('Gemini Key Issue - Click Test Key in settings');
    }

    activeBtn.innerHTML = originalText;
    activeBtn.disabled = false;
  } else {
    fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
    showToast('Add Gemini API Key in Profile Settings for AI generations!');
  }
}

function fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText) {
  let generated = '';

  if (type === 'cover-letter') {
    outputTitle.innerHTML = `<i class="fa-solid fa-file-signature text-indigo-400"></i> Local Template Cover Letter (${tone})`;
    generated = `Dear Hiring Manager at ${company},

I am writing to express my strong enthusiasm for the ${position} role at ${company}. With over 5 years of software engineering experience specializing in high-performance web applications and cloud architectures, I have closely followed ${company}'s innovations and product vision.

${profile.summary}

${jd ? `Key alignment with your job requirements:\n- Proficient in solving core challenges mentioned in your role specification.\n- Proven track record of delivering reliable features with rapid velocity.\n` : ''}
${profile.pitch}

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and hands-on skills can add immediate value to ${company}.

Best regards,

${profile.name}
${profile.contact}
${profile.linkedin}

---------------------------------------------------
💡 Tip: Enter a free Gemini API Key in Profile Settings to generate deep AI cover letters with Gemini!`;
  } else if (type === 'cold-email') {
    outputTitle.innerHTML = `<i class="fa-solid fa-paper-plane text-indigo-400"></i> Local Template Cold Email (${tone})`;
    generated = `Subject: Expressing Interest: ${position} at ${company} - ${profile.name}

Hi [Recruiter/Hiring Manager Name],

I hope you're having a great week! 

I recently saw the ${position} position open at ${company} and wanted to reach out directly. Given my experience in full-stack architecture and building customer-centric web applications, I am very excited about ${company}'s mission.

${profile.summary}

Here is a quick link to my portfolio & code profile: ${profile.portfolio}

I'd love to connect briefly or send over any additional details if you're open to a quick chat this week.

Best,

${profile.name}
${profile.contact}
${profile.linkedin}

---------------------------------------------------
💡 Tip: Enter a free Gemini API Key in Profile Settings to generate deep AI email templates!`;
  }

  outputText.textContent = generated;
}

function isFollowUpDue(job) {
  if (!job.dateApplied || job.status === 'Offered' || job.status === 'Rejected' || job.status === 'Wishlist') {
    return false;
  }

  if (job.followUpDate) {
    const today = new Date().toISOString().split('T')[0];
    return job.followUpDate <= today;
  }

  const appliedDate = new Date(job.dateApplied);
  const now = new Date();
  const diffDays = Math.floor((now - appliedDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 7 && job.status === 'Applied';
}

function checkFollowUpReminders() {
  const urgentJobs = jobs.filter(j => isFollowUpDue(j));
  const banner = document.getElementById('action-reminders-banner');
  const text = document.getElementById('reminder-text');

  if (urgentJobs.length > 0 && banner && text) {
    banner.classList.remove('hidden');
    text.textContent = `You have ${urgentJobs.length} application(s) (e.g. ${urgentJobs[0].company}) requiring follow-up action.`;
  } else if (banner) {
    banner.classList.add('hidden');
  }
}

function filterFollowUps() {
  currentSearch = '';
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.value = '';
  switchTab('kanban');
  showToast('Highlighting applications due for follow-up!');
}

// MODAL CONTROLLERS
function openAddJobModal() {
  document.getElementById('modal-job-title').innerHTML = `<i class="fa-solid fa-briefcase text-indigo-400"></i> Add New Job Application`;
  document.getElementById('form-job').reset();
  document.getElementById('job-id').value = '';
  document.getElementById('job-date').value = new Date().toISOString().split('T')[0];
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  document.getElementById('job-followup').value = nextWeek.toISOString().split('T')[0];

  document.getElementById('modal-job').classList.remove('hidden');
}

function openEditJobModal(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('modal-job-title').innerHTML = `<i class="fa-solid fa-pen text-indigo-400"></i> Edit Job Application`;
  document.getElementById('job-id').value = job.id;
  document.getElementById('job-company').value = job.company || '';
  document.getElementById('job-position').value = job.position || '';
  document.getElementById('job-status').value = job.status || 'Applied';
  document.getElementById('job-workmode').value = job.workMode || 'Remote';
  document.getElementById('job-salary').value = job.salary || '';
  document.getElementById('job-url').value = job.url || '';
  document.getElementById('job-location').value = job.location || '';
  document.getElementById('job-date').value = job.dateApplied || '';
  document.getElementById('job-followup').value = job.followUpDate || '';
  document.getElementById('job-contact').value = job.contact || '';
  document.getElementById('job-notes').value = job.notes || '';

  closeDetailModal();
  document.getElementById('modal-job').classList.remove('hidden');
}

function closeJobModal() {
  document.getElementById('modal-job').classList.add('hidden');
}

function saveJobForm(e) {
  e.preventDefault();
  const id = document.getElementById('job-id').value;

  const jobData = {
    id: id || `job_${Date.now()}`,
    company: document.getElementById('job-company').value.trim(),
    position: document.getElementById('job-position').value.trim(),
    status: document.getElementById('job-status').value,
    workMode: document.getElementById('job-workmode').value,
    salary: document.getElementById('job-salary').value.trim(),
    url: document.getElementById('job-url').value.trim(),
    location: document.getElementById('job-location').value.trim(),
    dateApplied: document.getElementById('job-date').value,
    followUpDate: document.getElementById('job-followup').value,
    contact: document.getElementById('job-contact').value.trim(),
    notes: document.getElementById('job-notes').value.trim()
  };

  if (id) {
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1) jobs[idx] = jobData;
  } else {
    jobs.unshift(jobData);
  }

  saveJobsData();
  closeJobModal();
  showToast(`Saved application for ${jobData.company}!`);
}

function openJobDetailModal(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('detail-company').textContent = job.company;
  document.getElementById('detail-position').textContent = job.position;
  
  const badge = document.getElementById('detail-badge');
  badge.textContent = job.status;
  badge.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(job.status)}`;

  document.getElementById('detail-workmode').textContent = job.workMode || '-';
  document.getElementById('detail-salary').textContent = job.salary || '-';
  document.getElementById('detail-date').textContent = job.dateApplied || '-';
  document.getElementById('detail-followup').textContent = job.followUpDate || '-';
  
  const urlElem = document.getElementById('detail-url');
  const urlText = document.getElementById('detail-url-text');
  if (job.url) {
    urlElem.href = job.url;
    urlText.textContent = job.url;
    document.getElementById('detail-url-container').classList.remove('hidden');
  } else {
    document.getElementById('detail-url-container').classList.add('hidden');
  }

  const contactElem = document.getElementById('detail-contact');
  if (job.contact) {
    contactElem.textContent = job.contact;
    document.getElementById('detail-contact-container').classList.remove('hidden');
  } else {
    document.getElementById('detail-contact-container').classList.add('hidden');
  }

  document.getElementById('detail-notes').textContent = job.notes || 'No extra notes specified.';

  document.getElementById('btn-edit-job').onclick = () => openEditJobModal(job.id);
  document.getElementById('btn-delete-job').onclick = () => deleteJob(job.id);
  document.getElementById('btn-ai-generate-job').onclick = () => {
    closeDetailModal();
    switchTab('faster');
    document.getElementById('ai-company').value = job.company;
    document.getElementById('ai-position').value = job.position;
    document.getElementById('ai-jd').value = job.notes;
    generateAIText('cover-letter');
  };

  document.getElementById('modal-detail').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('modal-detail').classList.add('hidden');
}

function deleteJob(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (confirm(`Are you sure you want to delete application for ${job ? job.company : 'this job'}?`)) {
    jobs = jobs.filter(j => j.id !== jobId);
    saveJobsData();
    closeDetailModal();
    showToast('Application deleted.');
  }
}

function openMasterProfileModal() {
  updateProfileDOM();
  document.getElementById('modal-profile').classList.remove('hidden');
}

function closeMasterProfileModal() {
  document.getElementById('modal-profile').classList.add('hidden');
}

function saveProfileForm(e) {
  e.preventDefault();
  profile = {
    name: document.getElementById('prof-name').value.trim(),
    contact: document.getElementById('prof-contact').value.trim(),
    linkedin: document.getElementById('prof-linkedin').value.trim(),
    portfolio: document.getElementById('prof-portfolio').value.trim(),
    summary: document.getElementById('prof-summary').value.trim(),
    pitch: document.getElementById('prof-pitch').value.trim(),
    geminiApiKey: document.getElementById('prof-gemini-key').value.trim()
  };

  saveProfileData();
  closeMasterProfileModal();
  showToast('Profile & Gemini API key saved!');
}

function openBookmarkletModal() {
  document.getElementById('modal-bookmarklet').classList.remove('hidden');
}

function closeBookmarkletModal() {
  document.getElementById('modal-bookmarklet').classList.add('hidden');
}

function updateBookmarkletSnippet() {
  const bookmarkletCode = `javascript:(function(){
    var title = document.title || '';
    var company = prompt('Extracting job application details.\\nConfirm Company Name:', title.split('|')[0].trim());
    if(company){
      alert('Job clipped for CareerFlow! Open CareerFlow App and click "Add Job" to save.');
    }
  })();`;

  const codeArea = document.getElementById('bookmarklet-code');
  if (codeArea) codeArea.value = bookmarkletCode.replace(/\s+/g, ' ');
}

function copyBookmarkletCode() {
  const codeArea = document.getElementById('bookmarklet-code');
  if (codeArea) {
    copyToClipboard(codeArea.value, 'Bookmarklet Script');
  }
}

function exportDataJSON() {
  const exportPayload = {
    app: 'CareerFlow AI',
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile,
    jobs
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `CareerFlow_JobApplications_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Exported job records backup to JSON!');
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.jobs && Array.isArray(data.jobs)) {
        jobs = data.jobs;
        if (data.profile) profile = { ...profile, ...data.profile };
        saveJobsData();
        saveProfileData();
        showToast(`Successfully imported ${jobs.length} applications!`);
      } else {
        alert("Invalid backup file structure.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

function getBadgeClass(status) {
  switch (status) {
    case 'Wishlist': return 'badge-wishlist';
    case 'Applied': return 'badge-applied';
    case 'Screening': return 'badge-screening';
    case 'Interviewing': return 'badge-interview';
    case 'Offered': return 'badge-offer';
    case 'Rejected': return 'badge-rejected';
    default: return 'badge-wishlist';
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-100 flex items-center gap-2 shadow-lg';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400"></i> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
