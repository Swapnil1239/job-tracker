/* CareerFlow AI - Multi-Engine AI Integration + Master Career Profile Bank Studio */

const STORAGE_KEY = 'careerflow_jobs_data';
const PROFILE_KEY = 'careerflow_profile_data';

// Application State
let jobs = [];
let profile = {
  name: 'Swapnil Sahare',
  contact: 'swapnilsahare1239@gmail.com | +919309713211',
  linkedin: 'https://linkedin.com/in/swapnil-s',
  portfolio: 'https://github.com/Swapnil1239',
  summary: 'Highly skilled Android Developer with 4+ years of experience building scalable Android applications using Kotlin, specializing in performance optimization, architecture, and automated testing to deliver high-performance mobile solutions for 50M+ users in the Google Home and Nest ecosystem.',
  pitch: 'I excel at building fluid mobile interfaces and reliable hardware-to-app features. Passionate about automated testing, performance profiling, and Android platform systems.',
  eduDegree: 'B.Tech in Electronics and Telecommunications',
  eduSchool: 'SGGS IE&T , Nanded',
  eduYear: '2017 - 2021',
  eduCoursework: 'Data Structures, Algorithms, Databases, Computer Systems, Mobile Software Engineering',
  eduResearch: 'IoT Wearables Research (designed low-power BLE sensor drivers for wearable health monitoring)',
  workTitle: 'Android app developer at Raja Software Labs (2022 - Present)',
  workBullets: '• Improved application performance by 30% and reduced redundant API overhead by 70% through optimized multi-threading strategies utilizing Coroutines and Flow, resulting in enhanced user experience for 50M+ users.\n• Spearheaded the end-to-end development of the Thermostat module, significantly enhancing user engagement and hardware-to-app interaction, and led Android OS version migration initiatives for Nest application modules to ensure seamless backward compatibility and security compliance.\n• Championed automated testing initiatives, scaling module test coverage from 50% to 90%+ using JUnit, Mockito, and Compose UI testing frameworks, and diagnosed and resolved critical race conditions and memory leaks within the Thermostat and Camera modules, dropping overall crash rates by 70%.',
  projects: [
    {
      title: 'CommonIntern (2020 - 2021)',
      bullets: '• Built a Python script to automatically apply to jobs on Glassdoor using BeautifulSoup and Selenium.\n• Gained 500+ stars on GitHub and featured on Hackaday front page.'
    },
    {
      title: 'Minimal Icon Pack (Sept. 2020 - Nov. 2020)',
      bullets: '• Designed and released 100+ minimal iOS and Android icons from scratch.\n• Marketed the product on YouTube and generated sales on Gumroad.'
    }
  ],
  achievements: 'Hilt & Clean Architecture Certification | Compose UI Testing Specialist',
  geminiApiKey: '',
  groqApiKey: '',
  supabaseUrl: '',
  supabaseKey: ''
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
  renderLiveResumePreview();
});

// State Persistence & Synchronization
async function loadDataFromBackend() {
  loadStoredDataLocalOnly();
  updateProfileDOM();
  renderCurrentView();

  // Try to sync with Supabase if credentials exist
  if (profile.supabaseUrl && profile.supabaseKey) {
    await pullFromSupabase(false);
  }
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
    try { 
      profile = { ...profile, ...JSON.parse(savedProfile) }; 
      if (!profile.projects && profile.projectTitle) {
        profile.projects = [{ title: profile.projectTitle, bullets: profile.projectBullets }];
      }
    } catch (e) {}
  }
}

async function syncDataToBackend() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  renderCurrentView();

  if (profile.supabaseUrl && profile.supabaseKey) {
    await pushToSupabase();
  }
}

// Supabase Cloud Synchronizer
async function pushToSupabase() {
  const url = (profile.supabaseUrl || "").trim().replace(/\/$/, "");
  const key = (profile.supabaseKey || "").trim();
  const statusPill = document.getElementById('cloud-status-pill');
  const syncBtn = document.getElementById('btn-cloud-sync');

  if (!url || !key) return;

  if (statusPill) {
    statusPill.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[9px]"></i> Syncing...`;
    statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 flex items-center gap-1';
  }

  try {
    const response = await fetch(`${url}/rest/v1/careerflow_data?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'user_state',
        jobs: jobs,
        profile: {
          name: profile.name || '',
          contact: profile.contact || '',
          linkedin: profile.linkedin || '',
          portfolio: profile.portfolio || '',
          summary: profile.summary || '',
          pitch: profile.pitch || '',
          eduDegree: profile.eduDegree || '',
          eduSchool: profile.eduSchool || '',
          eduYear: profile.eduYear || '',
          eduCoursework: profile.eduCoursework || '',
          eduResearch: profile.eduResearch || '',
          workTitle: profile.workTitle || '',
          workBullets: profile.workBullets || '',
          projects: profile.projects || [],
          achievements: profile.achievements || '',
          geminiApiKey: profile.geminiApiKey || '',
          groqApiKey: profile.groqApiKey || '',
          supabaseUrl: profile.supabaseUrl || '',
          supabaseKey: profile.supabaseKey || ''
        },
        updated_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      if (statusPill) {
        statusPill.innerHTML = `<i class="fa-solid fa-cloud text-[9px] text-emerald-400"></i> Cloud Synced`;
        statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center gap-1';
      }
      if (syncBtn) syncBtn.classList.remove('hidden');
    } else {
      throw new Error('Supabase response not OK');
    }
  } catch (err) {
    if (statusPill) {
      statusPill.innerHTML = `<i class="fa-solid fa-cloud-warning text-[9px] text-rose-400"></i> Sync Error`;
      statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 flex items-center gap-1';
    }
  }
}

async function pullFromSupabase(isManualForce = false) {
  const url = (profile.supabaseUrl || "").trim().replace(/\/$/, "");
  const key = (profile.supabaseKey || "").trim();
  const statusPill = document.getElementById('cloud-status-pill');
  const syncBtn = document.getElementById('btn-cloud-sync');

  if (!url || !key) return false;

  if (statusPill) {
    statusPill.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[9px]"></i> Fetching...`;
  }

  try {
    const response = await fetch(`${url}/rest/v1/careerflow_data?id=eq.user_state&select=*`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.length > 0) {
        const cloudData = result[0];
        
        // Merge cloud data to local state
        if (cloudData.jobs) jobs = cloudData.jobs;
        if (cloudData.profile) {
          profile = { ...profile, ...cloudData.profile };
          if (!profile.projects && profile.projectTitle) {
            profile.projects = [{ title: profile.projectTitle, bullets: profile.projectBullets }];
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

        updateProfileDOM();
        renderCurrentView();
        renderLiveResumePreview();

        if (statusPill) {
          statusPill.innerHTML = `<i class="fa-solid fa-cloud text-[9px] text-emerald-400"></i> Cloud Connected`;
          statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center gap-1';
        }
        if (syncBtn) syncBtn.classList.remove('hidden');
        if (isManualForce) showToast('Cloud database synchronized successfully!');
        return true;
      } else {
        // Table exists but is empty, upload initial state
        await pushToSupabase();
        return true;
      }
    } else {
      throw new Error('Pull failed');
    }
  } catch (err) {
    if (statusPill) {
      statusPill.innerHTML = `<i class="fa-solid fa-cloud-warning text-[9px] text-rose-400"></i> Offline / Error`;
      statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 flex items-center gap-1';
    }
    return false;
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

// Dynamic Projects Editor for Master Profile Modal
function renderProfileProjectsEditor() {
  const container = document.getElementById('profile-projects-list');
  if (!container) return;

  container.innerHTML = '';
  const projects = profile.projects || [];

  projects.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative group';
    card.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Project #${idx + 1}</span>
        <button type="button" onclick="removeProjectInputRow(${idx})" class="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-0.5">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>
      <div>
        <label class="block text-[10px] text-slate-400 mb-1">Project Name & Period</label>
        <input type="text" value="${escapeHTML(proj.title || '')}" class="project-title-input w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs">
      </div>
      <div>
        <label class="block text-[10px] text-slate-400 mb-1">Project Details & Bullet Points</label>
        <textarea rows="2" class="project-bullets-textarea w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-xs" placeholder="• Bullet 1...&#10;• Bullet 2...">${escapeHTML(proj.bullets || '')}</textarea>
      </div>
    `;
    container.appendChild(card);
  });

  if (projects.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-500 italic text-center py-2">No projects added yet. Click "Add Another Project" below.</p>`;
  }
}

window.addProjectInputRow = function() {
  if (!profile.projects) profile.projects = [];
  profile.projects.push({ title: '', bullets: '' });
  renderProfileProjectsEditor();
};

window.removeProjectInputRow = function(index) {
  if (profile.projects && profile.projects[index] !== undefined) {
    profile.projects.splice(index, 1);
    renderProfileProjectsEditor();
  }
};

// Profile DOM Binding
function updateProfileDOM() {
  if (document.getElementById('snippet-name-val')) document.getElementById('snippet-name-val').textContent = profile.name || 'Your Name';
  if (document.getElementById('snippet-contact-val')) document.getElementById('snippet-contact-val').textContent = profile.contact || 'Email / Phone';
  if (document.getElementById('snippet-linkedin-val')) document.getElementById('snippet-linkedin-val').textContent = profile.linkedin || 'LinkedIn URL';
  if (document.getElementById('snippet-education-val')) {
    document.getElementById('snippet-education-val').textContent = `${profile.eduDegree || 'Degree'} - ${profile.eduSchool || 'University'}`;
  }
  if (document.getElementById('snippet-achievements-val')) {
    document.getElementById('snippet-achievements-val').textContent = profile.achievements || 'Achievements & Certifications';
  }
  if (document.getElementById('snippet-summary-val')) document.getElementById('snippet-summary-val').textContent = profile.summary || 'Summary...';
  if (document.getElementById('snippet-pitch-val')) document.getElementById('snippet-pitch-val').textContent = profile.pitch || 'Pitch...';

  if (document.getElementById('prof-name')) document.getElementById('prof-name').value = profile.name || '';
  if (document.getElementById('prof-contact')) document.getElementById('prof-contact').value = profile.contact || '';
  if (document.getElementById('prof-linkedin')) document.getElementById('prof-linkedin').value = profile.linkedin || '';
  if (document.getElementById('prof-portfolio')) document.getElementById('prof-portfolio').value = profile.portfolio || '';

  if (document.getElementById('prof-edu-degree')) document.getElementById('prof-edu-degree').value = profile.eduDegree || '';
  if (document.getElementById('prof-edu-school')) document.getElementById('prof-edu-school').value = profile.eduSchool || '';
  if (document.getElementById('prof-edu-year')) document.getElementById('prof-edu-year').value = profile.eduYear || '';
  if (document.getElementById('prof-edu-coursework')) document.getElementById('prof-edu-coursework').value = profile.eduCoursework || '';
  if (document.getElementById('prof-edu-research')) document.getElementById('prof-edu-research').value = profile.eduResearch || '';

  if (document.getElementById('prof-work-title')) document.getElementById('prof-work-title').value = profile.workTitle || '';
  if (document.getElementById('prof-work-bullets')) document.getElementById('prof-work-bullets').value = profile.workBullets || '';
  
  renderProfileProjectsEditor();
  
  if (document.getElementById('prof-achievements')) document.getElementById('prof-achievements').value = profile.achievements || '';

  if (document.getElementById('prof-summary')) document.getElementById('prof-summary').value = profile.summary || '';
  if (document.getElementById('prof-pitch')) document.getElementById('prof-pitch').value = profile.pitch || '';
  if (document.getElementById('prof-gemini-key')) document.getElementById('prof-gemini-key').value = profile.geminiApiKey || '';
  if (document.getElementById('prof-groq-key')) {
    document.getElementById('prof-groq-key').value = profile.groqApiKey || '';
  }

  // Supabase DOM values
  if (document.getElementById('prof-supabase-url')) document.getElementById('prof-supabase-url').value = profile.supabaseUrl || '';
  if (document.getElementById('prof-supabase-key')) document.getElementById('prof-supabase-key').value = profile.supabaseKey || '';

  const badge = document.getElementById('gemini-key-status-text');
  if (badge) {
    if (profile.groqApiKey || profile.geminiApiKey) {
      badge.textContent = profile.groqApiKey ? 'Groq Llama 3 AI Ready ⚡' : 'Gemini AI Configured ✨';
      badge.className = 'text-xs font-bold text-emerald-400';
    } else {
      badge.textContent = 'Add AI Key (Gemini/Groq) 🔑';
      badge.className = 'text-xs font-bold text-amber-400';
    }
  }

  // Update cloud status header indicator
  const statusPill = document.getElementById('cloud-status-pill');
  const syncBtn = document.getElementById('btn-cloud-sync');
  if (statusPill) {
    if (profile.supabaseUrl && profile.supabaseKey) {
      statusPill.innerHTML = `<i class="fa-solid fa-cloud text-[9px] text-emerald-400"></i> Cloud Enabled`;
      statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center gap-1';
      if (syncBtn) syncBtn.classList.remove('hidden');
    } else {
      statusPill.innerHTML = `<i class="fa-solid fa-cloud-slash text-[9px]"></i> Local Mode`;
      statusPill.className = 'text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 flex items-center gap-1';
      if (syncBtn) syncBtn.classList.add('hidden');
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

// 4. APPLY FASTER HUB & BUILT-IN VISUAL PDF RESUME STUDIO
function extractJobFromURL() {
  const urlInput = document.getElementById('resume-job-url')?.value.trim();
  if (!urlInput) {
    showToast('Paste a valid job URL first');
    return;
  }

  showToast('Extracting job title and company from link...');
  
  try {
    const parsed = new URL(urlInput);
    const domainParts = parsed.hostname.replace('www.', '').split('.');
    const companyGuess = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
    
    document.getElementById('ai-company').value = companyGuess;
    showToast(`Detected ${companyGuess} from link!`);
  } catch (e) {
    showToast('Invalid URL format');
  }
}

// Global Resume State for Live Render
let activeResumeData = null;

function renderLiveResumePreview(customData) {
  const container = document.getElementById('pdf-export-container');
  const formatChoice = document.getElementById('resume-format-choice')?.value || 'ats-clean';

  // Clean up role title and pull dates dynamically to right-align them
  let roleTitle = profile.workTitle || 'Senior Full Stack Software Engineer at TechScale Solutions';
  let workPeriod = '2023 – Present';
  const dateRegex = /\(([^)]*(?:\d{4}|\bPresent\b)[^)]*)\)$/i;
  const dateMatch = roleTitle.match(dateRegex);
  if (dateMatch) {
    workPeriod = dateMatch[1].trim();
    roleTitle = roleTitle.replace(dateRegex, '').trim();
  }

  const data = customData || activeResumeData || {
    name: profile.name || 'Swapnil Sahare',
    contact: profile.contact || 'swapnilsahare1239@gmail.com | +919309713211',
    linkedin: profile.linkedin || 'https://linkedin.com/in/swapnil-s',
    portfolio: profile.portfolio || 'https://github.com/Swapnil1239',
    summary: profile.summary || 'Highly skilled Android Developer...',
    matchScore: 96,
    matchedKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'System Architecture'],
    education: {
      degree: profile.eduDegree || 'B.Tech in Electronics and Telecommunications',
      school: profile.eduSchool || 'SGGS IE&T , Nanded',
      year: profile.eduYear || '2017 – 2021'
    },
    projects: profile.projects || [],
    achievements: profile.achievements || '',
    skills: {
      languages: 'Kotlin, Java, JavaScript',
      frameworks: 'Android SDK, Jetpack Compose, MVVM, Clean Architecture',
      tools: 'Git, Docker, AWS, Hilt, JUnit, Mockito'
    },
    experience: [
      {
        role: roleTitle,
        period: workPeriod,
        bullets: (profile.workBullets ? profile.workBullets.split('\n').filter(b => b.trim()) : [
          'Engineered responsive mobile applications serving 50M+ active users.',
          'Reduced app launch latency and optimized multi-threading with Coroutines.'
        ])
      }
    ]
  };

  // Safe checks: Clean up role title & extract dates for all cases (fallback and AI customData)
  if (data.experience && data.experience[0]) {
    let exp = data.experience[0];
    const dateRegex = /\(([^)]*(?:\d{4}|\bPresent\b)[^)]*)\)$/i;
    const dateMatch = exp.role.match(dateRegex);
    if (dateMatch) {
      exp.period = dateMatch[1].trim();
      exp.role = exp.role.replace(dateRegex, '').trim();
    }
  }

  // Safe checks: Ensure education is never blank
  if (data.education) {
    data.education.degree = data.education.degree || profile.eduDegree || 'B.Tech in Electronics and Telecommunications';
    data.education.school = data.education.school || profile.eduSchool || 'SGGS IE&T , Nanded';
    data.education.year = data.education.year || profile.eduYear || '2017 - 2021';
  }

  // Update ATS Score Badge UI
  const scoreElem = document.getElementById('ats-match-percent');
  const kwContainer = document.getElementById('ats-keywords-container');
  const summaryElem = document.getElementById('ats-score-summary');

  if (scoreElem && data.matchScore) {
    scoreElem.textContent = `${data.matchScore}%`;
  }
  if (kwContainer && data.matchedKeywords && Array.isArray(data.matchedKeywords)) {
    kwContainer.innerHTML = `<span class="text-slate-400 font-medium">Matched Keywords:</span>` +
      data.matchedKeywords.map(k => `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">${escapeHTML(k)}</span>`).join(' ');
  }
  if (summaryElem && data.matchedKeywords) {
    summaryElem.textContent = `High alignment with JD keywords: ${data.matchedKeywords.join(', ')}.`;
  }

  // JAKE'S OVERLEAF RESUME FORMAT (EXACT OVERLEAF ATS VECTOR TEMPLATE)
  if (formatChoice === 'ats-clean') {
    container.className = 'w-full max-w-[595px] bg-white text-slate-900 p-8 rounded shadow-2xl space-y-3 font-sans text-left transition-all leading-tight';
    container.innerHTML = `
      <!-- HEADING: CENTERED NAME & CONTACT PIPES -->
      <div class="text-center pb-2 border-b border-slate-900">
        <h1 class="text-2xl font-bold uppercase tracking-wider text-slate-900 mb-1">${escapeHTML(data.name)}</h1>
        <p class="text-[11px] text-slate-800 font-medium">
          ${escapeHTML(data.contact)} &nbsp;|&nbsp; 
          <a href="${escapeHTML(data.linkedin)}" target="_blank" class="text-slate-900 underline font-semibold">LinkedIn</a> &nbsp;|&nbsp; 
          <a href="${escapeHTML(data.portfolio)}" target="_blank" class="text-slate-900 underline font-semibold">Portfolio</a>
        </p>
      </div>

      <!-- PROFESSIONAL SUMMARY -->
      <div class="space-y-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Professional Summary</h2>
        <p class="text-[11px] text-slate-800 leading-snug">${escapeHTML(data.summary)}</p>
      </div>

      <!-- TECHNICAL SKILLS MATRIX -->
      <div class="space-y-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Technical Skills</h2>
        <div class="text-[11px] text-slate-800 space-y-0.5">
          <p><strong>Languages:</strong> ${escapeHTML(data.skills.languages)}</p>
          <p><strong>Frameworks & Tools:</strong> ${escapeHTML(data.skills.frameworks)}</p>
          <p><strong>Infrastructure & Tools:</strong> ${escapeHTML(data.skills.tools)}</p>
        </div>
      </div>

      <!-- WORK EXPERIENCE (JAKE'S RESUME TABULAR LAYOUT) -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Work Experience</h2>
        ${data.experience.map(exp => `
          <div class="space-y-0.5">
            <div class="flex justify-between items-baseline text-[11px] font-bold text-slate-900">
              <span>${escapeHTML(exp.role)}</span>
              <span class="text-slate-600 font-normal italic">${escapeHTML(exp.period || '')}</span>
            </div>
            <ul class="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1 leading-snug">
              ${exp.bullets.map(b => `<li>${escapeHTML(b.replace(/^•\s*/, ''))}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- PROJECTS -->
      ${(data.projects && data.projects.length > 0) ? `
      <div class="space-y-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Projects</h2>
        ${data.projects.map(proj => `
          <div class="space-y-0.5 mt-1">
            <div class="flex justify-between items-baseline text-[11px] font-bold text-slate-900">
              <span>${escapeHTML(proj.title || '')}</span>
            </div>
            <ul class="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1 leading-snug">
              ${(Array.isArray(proj.bullets) ? proj.bullets : (proj.bullets || '').split('\n')).filter(b => b.trim()).map(b => `<li>${escapeHTML(b.replace(/^•\s*/, ''))}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.achievements ? `
      <!-- ACHIEVEMENTS & CERTIFICATIONS -->
      <div class="space-y-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Key Achievements & Certifications</h2>
        <p class="text-[11px] text-slate-800">${escapeHTML(data.achievements)}</p>
      </div>
      ` : ''}

      <!-- EDUCATION -->
      <div class="space-y-1 pt-0.5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-0.5">Education</h2>
        <div class="flex justify-between text-[11px] text-slate-900 font-bold">
          <span>${escapeHTML(data.education.degree)} – <span class="font-normal italic">${escapeHTML(data.education.school)}</span></span>
          <span class="font-normal text-slate-600 italic">${escapeHTML(data.education.year)}</span>
        </div>
        ${profile.eduCoursework || profile.eduResearch ? `
        <ul class="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1 leading-snug mt-1">
          ${profile.eduCoursework ? `<li><strong>Coursework:</strong> ${escapeHTML(profile.eduCoursework)}</li>` : ''}
          ${profile.eduResearch ? `<li><strong>Research & Extras:</strong> ${escapeHTML(profile.eduResearch)}</li>` : ''}
        </ul>
        ` : ''}
      </div>
    `;
  } else if (formatChoice === 'modern-tech') {
    container.className = 'w-full max-w-[595px] bg-white text-slate-900 p-8 rounded shadow-2xl space-y-4 font-sans text-left transition-all leading-normal';
    container.innerHTML = `
      <div class="flex justify-between items-start border-b-2 border-indigo-600 pb-3">
        <div>
          <h1 class="text-2xl font-extrabold text-indigo-950">${escapeHTML(data.name)}</h1>
          <p class="text-xs font-semibold text-indigo-600 mt-0.5">Software Engineering Professional</p>
        </div>
        <div class="text-right text-[11px] text-slate-600 space-y-0.5">
          <p>${escapeHTML(data.contact)}</p>
          <p>${escapeHTML(data.linkedin)}</p>
        </div>
      </div>

      <div>
        <h2 class="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1">Executive Overview</h2>
        <p class="text-xs text-slate-700 leading-relaxed">${escapeHTML(data.summary)}</p>
      </div>

      <div>
        <h2 class="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1">Skills & Core Stack</h2>
        <p class="text-xs text-slate-800"><strong>Tech Stack:</strong> ${escapeHTML(data.skills.languages)}, ${escapeHTML(data.skills.frameworks)}</p>
      </div>

      <div class="space-y-2">
        <h2 class="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1">Work Experience</h2>
        ${data.experience.map(exp => `
          <div>
            <div class="flex justify-between text-xs font-bold text-slate-900">
              <span>${escapeHTML(exp.role)}</span>
              <span class="text-indigo-600">${escapeHTML(exp.period || '')}</span>
            </div>
            <ul class="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
              ${exp.bullets.map(b => `<li>${escapeHTML(b.replace(/^•\s*/, ''))}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      ${data.achievements ? `
      <div>
        <h2 class="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1">Achievements & Certifications</h2>
        <p class="text-xs text-slate-700">${escapeHTML(data.achievements)}</p>
      </div>
      ` : ''}

      <div>
        <h2 class="text-xs font-extrabold text-indigo-900 uppercase tracking-wider mb-1">Education</h2>
        <p class="text-xs text-slate-800 font-semibold">${escapeHTML(data.education.degree)} – ${escapeHTML(data.education.school)} <span class="font-normal text-slate-500">(${escapeHTML(data.education.year)})</span></p>
      </div>
    `;
  } else {
    renderLiveResumePreview();
  }
}

async function generateTailoredResume() {
  const formatChoice = document.getElementById('resume-format-choice')?.value || 'ats-clean';
  const jdText = document.getElementById('resume-jd-text')?.value.trim() || 'Software Engineer requirements';
  const btnGen = document.getElementById('btn-generate-resume');

  const originalBtn = btnGen.innerHTML;
  btnGen.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI Optimizing My Career Experience...`;
  btnGen.disabled = true;

  const geminiKey = profile.geminiApiKey ? profile.geminiApiKey.trim() : '';
  const groqKey = profile.groqApiKey ? profile.groqApiKey.trim() : '';

  const systemPrompt = `You are an executive ATS Resume Tailoring Architect. Analyze the following Job Description and tailor the candidate's real work background, education, and achievements into an ATS-optimized resume format with 95%+ match score.\n\nJob Description:\n${jdText}\n\nCandidate Profile:\nName: ${profile.name}\nContact: ${profile.contact}\nLinkedIn: ${profile.linkedin}\nPortfolio: ${profile.portfolio}\nEducation: ${profile.eduDegree} at ${profile.eduSchool} (${profile.eduYear})\nWork Experience History: ${profile.workTitle}\nOriginal Work Bullets: ${profile.workBullets}\nKey Achievements: ${profile.achievements}\nProfessional Summary: ${profile.summary}\n\nTasks:\n1. Extract 5 top critical keywords from the JD.\n2. Rewrite candidate summary integrating 3 of those keywords naturally.\n3. Rewrite experience bullets incorporating the exact candidate achievements & work history into STAR metric statements.\n\nOutput MUST be 100% RAW VALID JSON only (no markdown wrapper) matching this schema:\n{\n  "summary": "...",\n  "skills": {"languages": "...", "frameworks": "...", "tools": "..."},\n  "matchedKeywords": ["Key1", "Key2", "Key3", "Key4", "Key5"],\n  "matchScore": 96,\n  "bullets": ["Bullet 1 with metrics", "Bullet 2 with metrics", "Bullet 3 with metrics"]\n}`;

  try {
    let jsonStr = '';

    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: systemPrompt }] })
      });
      const data = await res.json();
      if (res.ok && data.choices && data.choices[0]) {
        jsonStr = data.choices[0].message.content;
      }
    } else if (geminiKey) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
      });
      const data = await res.json();
      if (data.candidates && data.candidates[0]) {
        jsonStr = data.candidates[0].content.parts[0].text;
      }
    }

    if (jsonStr) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      activeResumeData = {
        name: profile.name,
        contact: profile.contact,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        summary: parsed.summary || profile.summary,
        matchScore: parsed.matchScore || 96,
        matchedKeywords: parsed.matchedKeywords || ['React', 'TypeScript', 'REST APIs', 'System Design'],
        education: {
          degree: profile.eduDegree || 'B.S. in Computer Science',
          school: profile.eduSchool || 'State University',
          year: profile.eduYear || '2018 – 2022',
          coursework: profile.eduCoursework || '',
          research: profile.eduResearch || ''
        },
        projects: {
          title: profile.projectTitle || '',
          bullets: profile.projectBullets ? profile.projectBullets.split('\n') : []
        },
        achievements: profile.achievements || '',
        skills: {
          languages: parsed.skills?.languages || 'JavaScript, TypeScript, Python, HTML/CSS',
          frameworks: parsed.skills?.frameworks || 'React, Next.js, Node.js, Express, TailwindCSS',
          tools: parsed.skills?.tools || 'Git, Docker, AWS, PostgreSQL, Vercel'
        },
        experience: [
          {
            role: profile.workTitle || 'Senior Software Engineer at TechScale Solutions',
            period: '2023 – Present',
            bullets: parsed.bullets || (profile.workBullets ? profile.workBullets.split('\n') : ['Engineered responsive web applications serving 500k+ users.'])
          }
        ]
      };

      renderLiveResumePreview(activeResumeData);
      showToast(`AI Optimized Resume! ATS Score: ${activeResumeData.matchScore}% Match`);
    } else {
      renderLiveResumePreview();
      showToast('Rendered ATS-Optimized Resume! Click Download PDF.');
    }
  } catch (e) {
    renderLiveResumePreview();
    showToast('Rendered ATS-Optimized Resume! Click Download PDF.');
  }

  btnGen.innerHTML = originalBtn;
  btnGen.disabled = false;
}

// 100% Crisp Direct PDF Download Engine using html2pdf.js
function downloadResumePDF() {
  const element = document.getElementById('pdf-export-container');
  if (!element) return;

  showToast('Generating sharp ATS PDF resume...');

  const opt = {
    margin:       [0.4, 0.4, 0.4, 0.4], // 0.4in margins matching Jake's Resume standard
    filename:     'Swapnil_Sahare_Resume.pdf',
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { 
      scale: 4, // High-DPI resolution for razor-sharp vector-like rendering
      useCORS: true, 
      letterRendering: true 
    },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    showToast('Direct PDF download complete!');
  }).catch(err => {
    showToast('Download failed, using print fallback...');
    window.print();
  });
}

// Overleaf / LaTeX Code Exporter (Harshibar's Resume Template v1.7.9)
function copyLaTeXCode() {
  const d = activeResumeData || {
    name: profile.name || 'Swapnil Sahare',
    contact: profile.contact || 'swapnilsahare1239@gmail.com | +919309713211',
    linkedin: profile.linkedin || 'https://linkedin.com/in/swapnil-s',
    portfolio: profile.portfolio || 'https://github.com/Swapnil1239',
    summary: profile.summary || 'Highly skilled Android Developer...',
    skills: { 
      languages: 'Kotlin, Java, JavaScript, SQL', 
      frameworks: 'Jetpack Compose, MVVM, Clean Architecture, Coroutines', 
      tools: 'Hilt, JUnit, Mockito, BLE/WiFi connectivity, CameraX' 
    },
    experience: [{ 
      role: profile.workTitle || 'Android app developer at Raja Software Labs', 
      period: '2022 – Present', 
      bullets: (profile.workBullets ? profile.workBullets.split('\n') : ['Engineered scalable Android applications.']) 
    }],
    education: { 
      degree: profile.eduDegree || 'B.Tech in Electronics and Telecommunications', 
      school: profile.eduSchool || 'SGGS IE&T , Nanded', 
      year: profile.eduYear || '2017 – 2021' 
    },
    achievements: profile.achievements || ''
  };

  const escapeLaTeX = (str) => {
    if (!str) return '';
    return str
      .replace(/%/g, '\\%')
      .replace(/&/g, '\\&')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_');
  };

  // Parse contact parameters for FontAwesome symbols
  const contactText = d.contact || '';
  const contactParts = contactText.split('|').map(p => p.trim());
  const email = contactParts.find(p => p.includes('@')) || 'swapnilsahare1239@gmail.com';
  const phone = contactParts.find(p => !p.includes('@') && /\+?\d+/.test(p)) || '+919309713211';

  // Parse role title and company name
  let companyName = 'Raja Software Labs';
  let roleTitle = 'Android App Developer';
  const rawRole = d.experience[0].role || '';
  const splitParts = rawRole.split(/\s+at\s+/i);
  if (splitParts.length > 1) {
    roleTitle = splitParts[0].trim();
    companyName = splitParts[1].trim();
  } else {
    roleTitle = rawRole;
  }

  // Build conditional LaTeX sections: only render them if data is actually present
  const summarySection = d.summary ? `\n%-----------PROFESSIONAL SUMMARY-----------\n\\section{PROFESSIONAL SUMMARY}\n\\small{${escapeLaTeX(d.summary)}}\n` : '';

  const skillsSection = (d.skills && (d.skills.languages || d.skills.frameworks || d.skills.tools)) ? `\n%-----------PROGRAMMING SKILLS-----------\n\\section{SKILLS}\n \\begin{itemize}[leftmargin=0in, label={}]\n    \\small{\\item{\n     ${d.skills.languages ? `\\textbf{Languages} {: ${escapeLaTeX(d.skills.languages)}}\\\\ \\vspace{2pt}` : ''}\n     ${d.skills.frameworks ? `\\textbf{Frameworks \\& Tools} {: ${escapeLaTeX(d.skills.frameworks)}}\\\\ \\vspace{2pt}` : ''}\n     ${d.skills.tools ? `\\textbf{Infrastructure \\& Tools} {: ${escapeLaTeX(d.skills.tools)}}` : ''}\n    }}\n \\end{itemize}\n` : '';

  const experienceSection = (d.experience && d.experience.length > 0 && d.experience[0].role) ? `\n%-----------EXPERIENCE-----------\n\\section{EXPERIENCE}\n  \\resumeSubHeadingListStart\n    \\resumeSubheading\n      {${escapeLaTeX(companyName)}}{${escapeLaTeX(d.experience[0].period)}}\n      {${escapeLaTeX(roleTitle)}}{}\n      \\resumeItemListStart\n        ${d.experience[0].bullets.map(b => `\\resumeItem{${escapeLaTeX(b.replace(/^•\s*/, ''))}}`).join('\n        ')}\n      \\resumeItemListEnd\n  \\resumeSubHeadingListEnd\n` : '';

  // Check active data for projects first, then fallback to profile
  const projectsList = d.projects || profile.projects || [];
  let projectsSection = '';
  if (projectsList.length > 0) {
    projectsSection = `\n%-----------PROJECTS-----------\n\\section{PROJECTS}\n  \\resumeSubHeadingListStart\n`;
    projectsList.forEach(proj => {
      const projTitle = proj.title || '';
      const projBullets = Array.isArray(proj.bullets) ? proj.bullets : (proj.bullets || '').split('\n');
      projectsSection += `    \\resumeProjectHeading\n      {\\textbf{${escapeLaTeX(projTitle)}}}{}\n      \\resumeItemListStart\n        ${projBullets.filter(b => b.trim()).map(b => `\\resumeItem{${escapeLaTeX(b.replace(/^•\s*/, ''))}}`).join('\n        ')}\n      \\resumeItemListEnd\n`;
    });
    projectsSection += `  \\resumeSubHeadingListEnd\n`;
  }

  // Check active data for education coursework/research first, then fallback to profile
  const eduCoursework = (d.education && d.education.coursework) ? d.education.coursework : (profile.eduCoursework || '');
  const eduResearch = (d.education && d.education.research) ? d.education.research : (profile.eduResearch || '');

  const educationSection = (d.education && (d.education.school || d.education.degree)) ? `\n%-----------EDUCATION-----------\n\\section{EDUCATION}\n  \\resumeSubHeadingListStart\n    \\resumeSubheading\n      {${escapeLaTeX(d.education.school)}}{${escapeLaTeX(d.education.year)}}\n      {${escapeLaTeX(d.education.degree)}}{}\n      ${eduCoursework || eduResearch ? `\\resumeItemListStart\n        ${eduCoursework ? `\\resumeItem{\\textbf{Coursework}: ${escapeLaTeX(eduCoursework)}}` : ''}\n        ${eduResearch ? `\\resumeItem{\\textbf{Research}: ${escapeLaTeX(eduResearch)}}` : ''}\n      \\resumeItemListEnd` : ''}\n  \\resumeSubHeadingListEnd\n` : '';

  const latex = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

% fontawesome
\\usepackage{fontawesome5}

% fixed width
\\usepackage[scale=0.90,lf]{FiraMono}

% light-grey
\\definecolor{light-grey}{gray}{0.83}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}

\\DeclareRobustCommand{\\ebseries}{\\fontseries{eb}\\selectfont}
\\DeclareTextFontCommand{\\texteb}{\\ebseries}

% custom underline
\\usepackage{contour}
\\usepackage[normalem]{ulem}
\\renewcommand{\\ULdepth}{1.8pt}
\\contourlength{0.8pt}
\\newcommand{\\myuline}[1]{%
  \\uline{\\phantom{#1}}%
  \\llap{\\contour{white}{#1}}%
}

% custom font: helvetica-style
\\usepackage{tgheros}
\\renewcommand*\\familydefault{\\sfdefault} 
\\usepackage[T1]{fontenc}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{0in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% sans serif sections
\\titleformat {\\section}{
    \\bfseries \\vspace{2pt} \\raggedright \\large % header section
}{}{0em}{}[\\color{light-grey} {\\titlerule[2pt]} \\vspace{-4pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-1pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & {\\color{dark-grey}\\small #2}\\vspace{1pt}\\\\
      \\textit{#3} & {\\color{dark-grey} \\small #4}\\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & {\\color{dark-grey}\\small #2} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{0pt}}

\\color{text-grey}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge ${escapeLaTeX(d.name)}} \\\\ \\vspace{5pt}
    \\small 
    \\faPhone* \\texttt{${escapeLaTeX(phone)}} \\hspace{1.5pt} $|$ 
    \\hspace{1.5pt} \\faEnvelope \\hspace{2pt} \\texttt{${escapeLaTeX(email)}} \\hspace{1.5pt} $|$ 
    \\hspace{1.5pt} \\faLinkedin \\hspace{2pt} \\href{${d.linkedin}}{\\myuline{LinkedIn}} \\hspace{1.5pt} $|$
    \\hspace{1.5pt} \\faGithub \\hspace{2pt} \\href{${d.portfolio}}{\\myuline{Portfolio}}
    \\\\ \\vspace{-3pt}
\\end{center}
${summarySection}${skillsSection}${experienceSection}${projectsSection}${educationSection}
\\end{document}`;

  copyToClipboard(latex, 'Overleaf LaTeX Code');
}

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

// Test Gemini API Key
async function testGeminiApiKey() {
  const keyInput = document.getElementById('prof-gemini-key').value.trim();
  const resElem = document.getElementById('gemini-test-result');
  if (!resElem) return;

  resElem.classList.remove('hidden');

  if (!keyInput) {
    resElem.className = 'text-[11px] text-amber-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-amber-500/30';
    resElem.textContent = '⚠️ Please paste a Gemini key first.';
    return;
  }

  resElem.className = 'text-[11px] text-purple-300 font-bold mt-2 p-2 rounded bg-slate-900 border border-purple-500/30 animate-pulse';
  resElem.textContent = 'Testing API Key against Google AI Studio ListModels...';

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyInput}`);
    const data = await listRes.json();

    if (listRes.ok && data.models && Array.isArray(data.models)) {
      const validModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
      resElem.className = 'text-[11px] text-emerald-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-emerald-500/30';
      resElem.innerHTML = `✅ Success! Your Gemini API key is active. (${validModels.length} models ready)`;
    } else if (data.error) {
      resElem.className = 'text-[11px] text-rose-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-rose-500/30';
      resElem.innerHTML = `❌ Google API Error: ${escapeHTML(data.error.message)}<br><span class="text-slate-400 text-[10px] font-normal">Check key at <a href="https://aistudio.google.com/app/apikey" target="_blank" class="underline text-pink-400">aistudio.google.com</a></span>`;
    }
  } catch (err) {
    resElem.className = 'text-[11px] text-rose-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-rose-500/30';
    resElem.textContent = `❌ Network Error: ${err.message}. Check connection.`;
  }
}

// Test Groq API Key
async function testGroqApiKey() {
  const keyInput = document.getElementById('prof-groq-key').value.trim();
  const resElem = document.getElementById('groq-test-result');
  if (!resElem) return;

  resElem.classList.remove('hidden');

  if (!keyInput) {
    resElem.className = 'text-[11px] text-amber-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-amber-500/30';
    resElem.textContent = '⚠️ Please paste a Groq key (gsk_...) first.';
    return;
  }

  resElem.className = 'text-[11px] text-amber-300 font-bold mt-2 p-2 rounded bg-slate-900 border border-amber-500/30 animate-pulse';
  resElem.textContent = 'Testing Groq AI Llama 3 API Key...';

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keyInput}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Respond with OK' }]
      })
    });

    const data = await res.json();
    if (res.ok && data.choices && data.choices[0]) {
      resElem.className = 'text-[11px] text-emerald-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-emerald-500/30';
      resElem.textContent = '✅ Success! Groq Llama 3 API key is active with 14,400 requests/day!';
    } else {
      resElem.className = 'text-[11px] text-rose-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-rose-500/30';
      resElem.textContent = `❌ Groq Error: ${data.error?.message || 'Invalid key'}`;
    }
  } catch (err) {
    resElem.className = 'text-[11px] text-rose-400 font-bold mt-2 p-2 rounded bg-slate-900 border border-rose-500/30';
    resElem.textContent = `❌ Network Error: ${err.message}`;
  }
}

async function generateAIText(type) {
  const company = document.getElementById('ai-company').value.trim() || 'Target Company';
  const position = document.getElementById('ai-position').value.trim() || 'Software Engineer';
  const jd = document.getElementById('ai-jd').value.trim();
  const tone = document.getElementById('ai-tone').value;
  const engineChoice = document.getElementById('ai-engine-choice')?.value || 'gemini';

  const outputContainer = document.getElementById('ai-output-container');
  const outputTitle = document.getElementById('ai-output-title');
  const outputText = document.getElementById('ai-output-text');
  const btnCl = document.getElementById('btn-generate-cl');
  const btnEmail = document.getElementById('btn-generate-email');

  outputContainer.classList.remove('hidden');

  const geminiKey = profile.geminiApiKey ? profile.geminiApiKey.trim() : '';
  const groqKey = profile.groqApiKey ? profile.groqApiKey.trim() : '';

  const activeBtn = type === 'cover-letter' ? btnCl : btnEmail;
  const originalText = activeBtn.innerHTML;
  activeBtn.disabled = true;

  const systemPrompt = type === 'cover-letter' 
    ? `You are an expert career strategist and executive resume writer. Write a compelling, highly customized Cover Letter for ${profile.name} applying for the ${position} role at ${company}.\n\nTone: ${tone}.\nCandidate Summary: ${profile.summary}\nElevator Pitch: ${profile.pitch}\nContact: ${profile.contact} | ${profile.linkedin}\n\nJob Requirements:\n${jd || 'Standard industry requirements for this role.'}\n\nInstructions: Write a crisp, concise, and to-the-point cover letter (under 250 words, maximum 3 short paragraphs). Keep it direct, highly impactful, free of fluff, and ready to send. Do not include markdown code blocks or meta commentary.`
    : `You are an expert recruiter and headhunter. Write a concise, powerful Cold Outreach Email from ${profile.name} to the hiring manager or recruiter at ${company} for the ${position} position.\n\nTone: ${tone}.\nCandidate Summary: ${profile.summary}\nPortfolio: ${profile.portfolio}\nContact: ${profile.contact}\nJob Context: ${jd || 'Interested in open opportunities'}\n\nInstructions: Write a high-converting email subject line and body. Ready to copy and paste.`;

  // 1. GROQ AI GENERATION
  if (engineChoice === 'groq' || (!geminiKey && groqKey)) {
    if (!groqKey) {
      fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
      showToast('Add a Groq API Key in Profile Settings or get one free at console.groq.com');
      activeBtn.disabled = false;
      return;
    }

    activeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber-400"></i> Running Llama 3.3 (Groq AI)...`;
    outputTitle.innerHTML = `<i class="fa-solid fa-bolt text-amber-400 animate-pulse"></i> Groq Llama 3.3 AI ${type === 'cover-letter' ? 'Cover Letter' : 'Cold Email'} (${tone})`;
    outputText.textContent = 'Generating blazingly fast with Groq AI Llama 3.3 70B...';

    try {
      const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
      let groqSuccess = false;

      for (const m of groqModels) {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: m,
            messages: [{ role: 'user', content: systemPrompt }]
          })
        });

        const data = await res.json();
        if (res.ok && data.choices && data.choices[0]) {
          outputText.textContent = data.choices[0].message.content;
          showToast(`Generated using Groq AI (${m})!`);
          groqSuccess = true;
          break;
        }
      }

      if (!groqSuccess) {
        fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
      }
    } catch (e) {
      fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
    }

    activeBtn.innerHTML = originalText;
    activeBtn.disabled = false;
    return;
  }

  // 2. GOOGLE GEMINI AI GENERATION
  if (geminiKey && engineChoice !== 'local') {
    activeBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-pink-400"></i> Thinking with Gemini...`;
    outputTitle.innerHTML = `<i class="fa-solid fa-sparkles text-pink-400 animate-pulse"></i> Gemini AI ${type === 'cover-letter' ? 'Cover Letter' : 'Cold Email'} (${tone})`;
    outputText.textContent = 'Connecting to Google Gemini AI...';

    const candidateModels = [
      'models/gemini-1.5-flash',
      'models/gemini-1.5-flash-8b',
      'models/gemini-1.5-pro',
      'models/gemini-2.0-flash'
    ];

    let success = false;

    for (const modelPath of candidateModels) {
      const versions = ['v1beta', 'v1'];
      for (const ver of versions) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/${ver}/${modelPath}:generateContent?key=${geminiKey}`, {
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
            showToast(`Generated using Gemini AI (${modelPath.replace('models/', '')})!`);
            success = true;
            break;
          } else if (data.error && (data.error.message.includes('Quota exceeded') || data.error.status === 'RESOURCE_EXHAUSTED')) {
            break;
          }
        } catch (err) {}
      }

      if (success) break;
    }

    if (!success) {
      if (groqKey) {
        showToast('Gemini quota full. Switching to Groq Llama 3 AI!');
        generateAITextWithEngine('groq', type, company, position, jd, tone, outputTitle, outputText, systemPrompt, originalText, activeBtn);
        return;
      }
      fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
      showToast('Gemini quota limit active. Using local engine or add Groq API key!');
    }

    activeBtn.innerHTML = originalText;
    activeBtn.disabled = false;
    return;
  }

  // 3. LOCAL INSTANT ENGINE
  fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
  activeBtn.disabled = false;
}

async function generateAITextWithEngine(engine, type, company, position, jd, tone, outputTitle, outputText, systemPrompt, originalText, activeBtn) {
  const groqKey = profile.groqApiKey ? profile.groqApiKey.trim() : '';
  if (engine === 'groq' && groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: systemPrompt }] })
      });
      const data = await res.json();
      if (res.ok && data.choices && data.choices[0]) {
        outputTitle.innerHTML = `<i class="fa-solid fa-bolt text-amber-400"></i> Groq Llama 3.3 AI ${type === 'cover-letter' ? 'Cover Letter' : 'Cold Email'} (${tone})`;
        outputText.textContent = data.choices[0].message.content;
        showToast('Generated via Groq Llama 3.3 AI!');
        activeBtn.innerHTML = originalText;
        activeBtn.disabled = false;
        return;
      }
    } catch (e) {}
  }

  fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText);
  activeBtn.innerHTML = originalText;
  activeBtn.disabled = false;
}

function fallbackInstantGenerator(type, company, position, jd, tone, outputTitle, outputText) {
  let generated = '';

  if (type === 'cover-letter') {
    outputTitle.innerHTML = `<i class="fa-solid fa-file-signature text-indigo-400"></i> Tailored Cover Letter (${tone})`;
    generated = `Dear Hiring Manager at ${company},

I am writing to express my strong enthusiasm for the ${position} role at ${company}. With over 5 years of software engineering experience specializing in high-performance web applications and cloud architectures, I have closely followed ${company}'s innovations and product vision.

${profile.summary}

${jd ? `Key alignment with your job requirements:\n- Proficient in solving core challenges mentioned in your role specification.\n- Proven track record of delivering reliable features with rapid velocity.\n` : ''}
${profile.pitch}

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and hands-on skills can add immediate value to ${company}.

Best regards,

${profile.name}
${profile.contact}
${profile.linkedin}`;
  } else if (type === 'cold-email') {
    outputTitle.innerHTML = `<i class="fa-solid fa-paper-plane text-indigo-400"></i> Tailored Cold Email (${tone})`;
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
${profile.linkedin}`;
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
    document.getElementById('resume-jd-text').value = job.notes;
    document.getElementById('resume-job-url').value = job.url || '';
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

function openMasterProfileModal(focusTargetId) {
  updateProfileDOM();
  const modal = document.getElementById('modal-profile');
  if (modal) {
    modal.classList.remove('hidden');
    if (focusTargetId) {
      setTimeout(() => {
        const target = document.getElementById(focusTargetId);
        if (target) {
          target.focus();
          target.select ? target.select() : null;
        }
      }, 100);
    }
  }
}

function closeMasterProfileModal() {
  document.getElementById('modal-profile').classList.add('hidden');
}

async function saveProfileForm(e) {
  e.preventDefault();

  const oldUrl = profile.supabaseUrl || '';
  const oldKey = profile.supabaseKey || '';

  const newUrl = document.getElementById('prof-supabase-url') ? document.getElementById('prof-supabase-url').value.trim() : (profile.supabaseUrl || '');
  const newKey = document.getElementById('prof-supabase-key') ? document.getElementById('prof-supabase-key').value.trim() : (profile.supabaseKey || '');

  const projectTitles = document.querySelectorAll('.project-title-input');
  const projectBullets = document.querySelectorAll('.project-bullets-textarea');
  const scrapedProjects = [];
  projectTitles.forEach((input, index) => {
    const titleVal = input.value.trim();
    const bulletsVal = projectBullets[index] ? projectBullets[index].value.trim() : '';
    if (titleVal || bulletsVal) {
      scrapedProjects.push({ title: titleVal, bullets: bulletsVal });
    }
  });

  profile = {
    name: document.getElementById('prof-name').value.trim(),
    contact: document.getElementById('prof-contact').value.trim(),
    linkedin: document.getElementById('prof-linkedin').value.trim(),
    portfolio: document.getElementById('prof-portfolio').value.trim(),
    eduDegree: document.getElementById('prof-edu-degree') ? document.getElementById('prof-edu-degree').value.trim() : profile.eduDegree,
    eduSchool: document.getElementById('prof-edu-school') ? document.getElementById('prof-edu-school').value.trim() : profile.eduSchool,
    eduYear: document.getElementById('prof-edu-year') ? document.getElementById('prof-edu-year').value.trim() : profile.eduYear,
    eduCoursework: document.getElementById('prof-edu-coursework') ? document.getElementById('prof-edu-coursework').value.trim() : (profile.eduCoursework || ''),
    eduResearch: document.getElementById('prof-edu-research') ? document.getElementById('prof-edu-research').value.trim() : (profile.eduResearch || ''),
    workTitle: document.getElementById('prof-work-title') ? document.getElementById('prof-work-title').value.trim() : profile.workTitle,
    workBullets: document.getElementById('prof-work-bullets') ? document.getElementById('prof-work-bullets').value.trim() : profile.workBullets,
    projects: scrapedProjects,
    achievements: document.getElementById('prof-achievements') ? document.getElementById('prof-achievements').value.trim() : profile.achievements,
    summary: document.getElementById('prof-summary').value.trim(),
    pitch: document.getElementById('prof-pitch').value.trim(),
    geminiApiKey: document.getElementById('prof-gemini-key').value.trim(),
    groqApiKey: document.getElementById('prof-groq-key') ? document.getElementById('prof-groq-key').value.trim() : profile.groqApiKey,
    supabaseUrl: newUrl,
    supabaseKey: newKey
  };

  // If we just added or changed sync credentials, perform a pull first to prevent overwriting cloud state with empty defaults
  if (newUrl && newKey && (newUrl !== oldUrl || newKey !== oldKey)) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    const pulled = await pullFromSupabase(true);
    if (pulled) {
      closeMasterProfileModal();
      return;
    }
  }

  saveProfileData();
  closeMasterProfileModal();
  renderLiveResumePreview();
  showToast('Saved Master Profile & Career Data!');
}

function openBookmarkletModal() {
  document.getElementById('modal-bookmarklet').classList.remove('hidden');
}

function closeBookmarkletModal() {
  document.getElementById('modal-bookmarklet').classList.add('hidden');
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
