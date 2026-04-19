/* ObservationTracker — Application Logic */
/* Copyright (c) 2026 Mustafa Uzumeri. All rights reserved. */

const STORAGE_KEY = 'observationTracker';
const RATING_LABELS = ['', 'Struggling', 'Emerging', 'Developing', 'Mastered'];
const RATING_EMOJI = ['', '🟥', '🟧', '🟦', '🟩'];
const GOAL_AREAS = ['academic', 'social', 'behavioral', 'communication', 'motor'];
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ============================================================
// UTILITIES
// ============================================================
const genId = () => Math.random().toString(36).slice(2, 10);
const toast = (msg, type='success') => {
  const el = document.createElement('div');
  el.className = `toast ${type}`; el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};
const ago = (iso) => {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms/60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs/24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', {month:'short', day:'numeric'});
};
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'});
const dayKey = (iso) => new Date(iso).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});

// ============================================================
// STORAGE
// ============================================================
const DB = {
  _data: null,
  load() {
    if (!this._data) {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? JSON.parse(raw) : { teacher: null, students: [], goals: [], observations: [] };
    }
    return this._data;
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); },
  reset() { localStorage.removeItem(STORAGE_KEY); this._data = null; },

  setTeacher(name) { this.load().teacher = { name }; this.save(); },
  addStudent(name, grade, notes) {
    const s = { id: genId(), name, grade: grade||'', notes: notes||'', createdAt: new Date().toISOString() };
    this.load().students.push(s); this.save(); return s;
  },
  getStudent(id) { return this.load().students.find(s => s.id === id); },
  removeStudent(id) {
    const d = this.load();
    d.students = d.students.filter(s => s.id !== id);
    d.goals = d.goals.filter(g => g.studentId !== id);
    d.observations = d.observations.filter(o => o.studentId !== id);
    this.save();
  },

  addGoal(studentId, area, description) {
    const g = { id: genId(), studentId, area, description, createdAt: new Date().toISOString() };
    this.load().goals.push(g); this.save(); return g;
  },
  getGoals(studentId) { return this.load().goals.filter(g => g.studentId === studentId); },
  removeGoal(id) {
    const d = this.load();
    d.goals = d.goals.filter(g => g.id !== id);
    this.save();
  },

  addObservation(studentId, goalId, rating, note) {
    const o = { id: genId(), studentId, goalId, rating, note: note||'', timestamp: new Date().toISOString() };
    this.load().observations.push(o); this.save(); return o;
  },
  getObservations(studentId, goalId) {
    const obs = this.load().observations;
    if (goalId) return obs.filter(o => o.studentId === studentId && o.goalId === goalId);
    if (studentId) return obs.filter(o => o.studentId === studentId);
    return obs;
  },
  getRecentObservations(limit = 20) {
    return [...this.load().observations].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  },
  getLastObservation(studentId) {
    const obs = this.getObservations(studentId);
    return obs.length > 0 ? obs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : null;
  },
  getGoalById(id) { return this.load().goals.find(g => g.id === id); }
};

// ============================================================
// STATE
// ============================================================
const state = {
  view: 'setup',
  viewParams: {},
  logStep: 0,
  logData: { studentId: null, goalId: null, rating: null, note: '' }
};

// ============================================================
// DEMO DATA
// ============================================================
const DEMO = {
  load() {
    DB.reset();
    DB.setTeacher('Ms. Rodriguez');

    const students = [
      { name: 'Jayden Carter', grade: '3rd' },
      { name: 'Amara Okafor', grade: '3rd' },
      { name: 'Liam Novak', grade: '3rd' },
      { name: 'Sophie Chen', grade: '4th' },
      { name: 'Marcus Williams', grade: '4th' },
      { name: 'Zara Patel', grade: '4th' },
      { name: 'Ethan Brooks', grade: '3rd' },
      { name: 'Isabella Torres', grade: '4th' }
    ].map(s => DB.addStudent(s.name, s.grade));

    // Goals per student
    const goalSets = [
      // Jayden: behavioral + academic
      [{ area:'behavioral', desc:'Remain seated during instruction for 15+ minutes without prompting' },
       { area:'academic', desc:'Complete multi-step math word problems independently' },
       { area:'social', desc:'Use appropriate voice volume in group settings' }],
      // Amara: communication + academic
      [{ area:'communication', desc:'Initiate conversation with peers during unstructured time' },
       { area:'academic', desc:'Read grade-level passages with 90%+ accuracy' },
       { area:'social', desc:'Participate in group activities without adult facilitation' }],
      // Liam: motor + behavioral
      [{ area:'motor', desc:'Write legibly on standard lined paper with proper letter sizing' },
       { area:'behavioral', desc:'Transition between activities within 2 minutes' },
       { area:'academic', desc:'Organize materials in desk/backpack without reminders' }],
      // Sophie: academic + social
      [{ area:'academic', desc:'Solve two-digit multiplication problems with 80%+ accuracy' },
       { area:'social', desc:'Resolve peer conflicts using taught strategies' },
       { area:'communication', desc:'Express needs to adults using complete sentences' }],
      // Marcus: behavioral + communication
      [{ area:'behavioral', desc:'Follow 3-step directions without repetition' },
       { area:'communication', desc:'Raise hand and wait to be called on before speaking' },
       { area:'academic', desc:'Identify main idea in grade-level non-fiction text' }],
      // Zara: social + academic
      [{ area:'social', desc:'Engage in cooperative play with at least one peer for 10+ minutes' },
       { area:'academic', desc:'Write 3+ sentence paragraphs with topic sentence and details' },
       { area:'motor', desc:'Use scissors to cut along curved lines with accuracy' }],
      // Ethan: behavioral + motor
      [{ area:'behavioral', desc:'Accept changes in routine without escalation' },
       { area:'motor', desc:'Hold pencil with appropriate tripod grip consistently' },
       { area:'social', desc:'Take turns in structured games without adult prompting' }],
      // Isabella: communication + academic
      [{ area:'communication', desc:'Use age-appropriate vocabulary in oral responses' },
       { area:'academic', desc:'Decode unfamiliar words using phonetic strategies' },
       { area:'social', desc:'Maintain eye contact during conversation for 30+ seconds' }]
    ];

    const allGoals = [];
    goalSets.forEach((goals, si) => {
      goals.forEach(g => {
        allGoals.push(DB.addGoal(students[si].id, g.area, g.desc));
      });
    });

    // Generate realistic observations over past 3 weeks
    const now = Date.now();
    const obsData = [
      // Jayden - behavioral improving
      { si:0, gi:0, entries:[
        { d:-20, r:1, n:'Up and wandering 3 times during math lesson. Redirected each time.' },
        { d:-18, r:1, n:'Left seat twice during reading. Stood at window.' },
        { d:-15, r:2, n:'Stayed seated for about 10 minutes before getting up. Progress.' },
        { d:-12, r:2, n:'Fidgeting but remained seated with small breaks. Used fidget tool.' },
        { d:-9, r:3, n:'Stayed seated through entire 20-min lesson! First time.' },
        { d:-6, r:2, n:'Rough day. Up twice but self-corrected once without prompt.' },
        { d:-3, r:3, n:'Seated for full group instruction. Raised hand to ask question.' },
        { d:-1, r:4, n:'Excellent focus today. Remained seated and engaged for 25 minutes.' }
      ]},
      { si:0, gi:1, entries:[
        { d:-19, r:1, n:'Could not identify what operation to use. Gave up after first step.' },
        { d:-14, r:2, n:'Identified addition needed but made errors in computation.' },
        { d:-10, r:2, n:'Completed 2 of 4 problems with visual support.' },
        { d:-5, r:3, n:'Solved 3-step problem independently. Needed hint on the last step only.' },
        { d:-2, r:3, n:'Working through problems systematically now. Accuracy improving.' }
      ]},
      // Amara - communication steady
      { si:1, gi:0, entries:[
        { d:-19, r:1, n:'No peer interaction during free time. Sat alone drawing.' },
        { d:-15, r:2, n:'Responded to peer who approached her. Did not initiate.' },
        { d:-11, r:2, n:'Said hi to Sophie at snack time. Brief exchange.' },
        { d:-7, r:2, n:'Asked Isabella to play during recess. Conversation lasted ~1 min.' },
        { d:-3, r:3, n:'Initiated conversation with two different peers today!' },
        { d:-1, r:2, n:'Quieter today. One brief initiation during art.' }
      ]},
      { si:1, gi:1, entries:[
        { d:-17, r:3, n:'Read passage at grade level with minimal errors. Fluency improving.' },
        { d:-10, r:3, n:'92% accuracy on reading assessment. Strong decoding.' },
        { d:-4, r:4, n:'Read new story aloud with expression. 95% accuracy. Great progress!' }
      ]},
      // Liam - motor skills
      { si:2, gi:0, entries:[
        { d:-18, r:1, n:'Letters inconsistent in size. Many above/below lines.' },
        { d:-13, r:2, n:'Using lined paper guide I made. Letters staying on lines better.' },
        { d:-8, r:2, n:'Capital letters appropriately sized. Lowercase still variable.' },
        { d:-4, r:3, n:'Completed writing assignment with mostly legible handwriting.' },
        { d:-1, r:3, n:'Handwriting consistent through whole paragraph. Good spacing too.' }
      ]},
      // Sophie - math
      { si:3, gi:0, entries:[
        { d:-16, r:1, n:'Confused by carry-over in multiplication. Frustrated.' },
        { d:-12, r:2, n:'Using grid method successfully for some problems.' },
        { d:-8, r:2, n:'65% accuracy on practice set. Errors mostly in carrying.' },
        { d:-4, r:3, n:'80% on timed practice. Grid method working well.' },
        { d:-1, r:3, n:'Helped another student with multiplication today. Good understanding shown.' }
      ]},
      // Marcus - following directions
      { si:4, gi:0, entries:[
        { d:-20, r:1, n:'Needed every step repeated individually. Cannot hold multi-step.' },
        { d:-15, r:1, n:'Tried visual checklist. Completed step 1, forgot steps 2-3.' },
        { d:-10, r:2, n:'With checklist: completed 2 of 3 steps independently.' },
        { d:-6, r:2, n:'Paraphrased 2-step direction back to me. Completed both.' },
        { d:-2, r:3, n:'Followed 3-step art project instructions with one reminder on step 3.' }
      ]},
      // Zara - social
      { si:5, gi:0, entries:[
        { d:-17, r:2, n:'Played near peers but parallel, not cooperative. Shared space.' },
        { d:-12, r:2, n:'Joined Lego building with Ethan. Side by side but some talking.' },
        { d:-7, r:3, n:'Played board game with Sophie for 12 minutes. Took turns.' },
        { d:-3, r:3, n:'Invited Amara to play pretend. They played for 15 min.' },
        { d:0, r:4, n:'Organized a group drawing activity. Led the project. Outstanding.' }
      ]},
      // Ethan - routine changes
      { si:6, gi:0, entries:[
        { d:-19, r:1, n:'Fire drill triggered 20-minute meltdown. Could not transition back.' },
        { d:-14, r:2, n:'Schedule change (sub teacher). Upset but calmed with visual schedule.' },
        { d:-9, r:2, n:'Assembly interrupted math. Accepted after seeing it on the board.' },
        { d:-5, r:3, n:'Surprise visitor to class. Brief agitation, then joined activity.' },
        { d:-1, r:3, n:'Room change for testing. Transitioned with verbal prep only. No visual needed.' }
      ]},
      // Isabella - vocabulary
      { si:7, gi:0, entries:[
        { d:-16, r:2, n:'Using basic vocabulary. Correct but immature for grade level.' },
        { d:-11, r:2, n:'Used word "frustrated" instead of "mad". Building emotional vocab.' },
        { d:-6, r:3, n:'Described science experiment using taught vocabulary: "hypothesis", "observe".' },
        { d:-2, r:3, n:'Growing vocabulary evident in journal writing. Using new words from word wall.' }
      ]}
    ];

    obsData.forEach(od => {
      const studentGoals = DB.getGoals(students[od.si].id);
      const goal = studentGoals[od.gi];
      od.entries.forEach(e => {
        const ts = new Date(now + e.d * 86400000 + Math.random()*43200000).toISOString();
        const o = DB.addObservation(students[od.si].id, goal.id, e.r, e.n);
        // Backdate
        o.timestamp = ts;
      });
    });
    DB.save();
    toast('Demo loaded! You are Ms. Rodriguez.');
  }
};

// ============================================================
// AI REPORT GENERATOR
// ============================================================
const AIReport = {
  getApiKey() { return localStorage.getItem('ot_openrouter_key') || ''; },
  setApiKey(k) { localStorage.setItem('ot_openrouter_key', k); },

  generateMockReport(student, goals, observations) {
    const goalReports = goals.map(g => {
      const gObs = observations.filter(o => o.goalId === g.id).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      if (gObs.length === 0) return `**${g.description}** (${g.area})\nNo observations recorded for this goal yet.`;
      const recent = gObs.slice(-3);
      const first = gObs[0]; const last = gObs[gObs.length-1];
      const trend = last.rating > first.rating ? 'improving' : last.rating === first.rating ? 'stable' : 'declining';
      const avgRating = (gObs.reduce((s,o)=>s+o.rating,0)/gObs.length).toFixed(1);
      return `**${g.description}** (${g.area})\nObservations: ${gObs.length} over ${Math.ceil((new Date(last.timestamp)-new Date(first.timestamp))/86400000)} days\nTrend: ${trend} (${RATING_LABELS[first.rating]} \u2192 ${RATING_LABELS[last.rating]})\nAverage rating: ${avgRating}/4\n\nRecent notes:\n${recent.map(o => `\u2022 ${dayKey(o.timestamp)}: ${o.note} [${RATING_LABELS[o.rating]}]`).join('\n')}`;
    });

    return `# Progress Report: ${student.name}\nGrade: ${student.grade} | Generated: ${new Date().toLocaleDateString()}\nTeacher: ${DB.load().teacher?.name || 'Teacher'}\n\n---\n\n${goalReports.join('\n\n---\n\n')}`;
  },

  async generateAIReport(student, goals, observations) {
    const key = this.getApiKey();
    if (!key) return this.generateMockReport(student, goals, observations);
    try {
      const obsText = goals.map(g => {
        const gObs = observations.filter(o=>o.goalId===g.id).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        return `Goal (${g.area}): ${g.description}\nObservations:\n${gObs.map(o=>`  ${dayKey(o.timestamp)} - Rating: ${o.rating}/4 (${RATING_LABELS[o.rating]}) - ${o.note}`).join('\n')}`;
      }).join('\n\n');

      const res = await fetch(OPENROUTER_URL, {
        method:'POST',
        headers:{ 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages:[{
            role:'system',
            content:'You are a special education progress report writer. Given teacher observations about a student, write a professional IEP progress report. For each goal: summarize the trend, cite specific observations as evidence, and note areas needing continued support. Use professional but warm language appropriate for a parent conference. Be specific and evidence-based.'
          },{
            role:'user',
            content:`Student: ${student.name}, Grade: ${student.grade}\n\n${obsText}\n\nWrite a progress report covering each goal.`
          }],
          temperature:0.4, max_tokens:1000
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || this.generateMockReport(student, goals, observations);
    } catch(e) {
      console.error('AI report error:', e);
      return this.generateMockReport(student, goals, observations);
    }
  }
};

// ============================================================
// ANALYTICS
// ============================================================
const Analytics = {
  getTrend(observations) {
    if (observations.length < 2) return 'flat';
    const sorted = [...observations].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    const recent = sorted.slice(-3);
    const earlier = sorted.slice(0, Math.min(3, sorted.length));
    const recentAvg = recent.reduce((s,o)=>s+o.rating,0)/recent.length;
    const earlierAvg = earlier.reduce((s,o)=>s+o.rating,0)/earlier.length;
    if (recentAvg > earlierAvg + 0.3) return 'up';
    if (recentAvg < earlierAvg - 0.3) return 'down';
    return 'flat';
  },
  getAttentionStatus(studentId) {
    const last = DB.getLastObservation(studentId);
    if (!last) return 'overdue';
    const daysSince = (Date.now() - new Date(last.timestamp).getTime()) / 86400000;
    if (daysSince > 5) return 'overdue';
    if (daysSince < 2) return 'recent';
    return 'ok';
  }
};

// ============================================================
// ROUTER & RENDER
// ============================================================
const navigate = (view, params={}) => {
  state.view = view;
  state.viewParams = params;
  if (view === 'log') { state.logStep = 0; state.logData = { studentId:null, goalId:null, rating:null, note:'' }; }
  render();
};

const render = () => {
  const app = document.getElementById('app');
  const d = DB.load();
  if (!d.teacher && state.view !== 'setup') { state.view = 'setup'; }
  const views = {
    'setup': viewSetup, 'dashboard': viewDashboard, 'log': viewLog,
    'timeline': viewTimeline, 'student': viewStudent, 'report': viewReport,
    'manage': viewManage, 'add-student': viewAddStudent, 'add-goal': viewAddGoal,
    'settings': viewSettings
  };
  app.innerHTML = (views[state.view] || viewSetup)();
};

const header = (title, leftAction='', rightAction='') => `
  <header class="app-header">
    <div style="display:flex;align-items:center;gap:8px;">
      ${leftAction}
      <h1>👁️ ${title}</h1>
    </div>
    <div class="header-actions">${rightAction}</div>
  </header>`;

const bottomNav = () => {
  const tabs = [
    { id:'dashboard', icon:'🏠', label:'Students' },
    { id:'log', icon:'➕', label:'Log' },
    { id:'timeline', icon:'📊', label:'Timeline' },
    { id:'manage', icon:'⚙️', label:'Manage' }
  ];
  const navItems = tabs.map(t => `<button class="nav-item ${state.view===t.id?'active':''}" data-action="nav" data-view="${t.id}">
      <span class="nav-icon">${t.icon}</span>${t.label}
    </button>`).join('');
  return `<nav class="desktop-nav">${navItems}</nav><nav class="bottom-nav">${navItems}</nav>`;
};

// ============================================================
// VIEW: SETUP
// ============================================================
const viewSetup = () => `
  <div class="setup-wrapper">
    <div class="setup-box">
      <div class="logo">👁️</div>
      <h1>ObservationTracker</h1>
      <p class="tagline">See every student. Capture insights in seconds.</p>
      <div class="setup-form">
        <form data-form="setup">
          <div class="form-group"><label>Your Name</label><input name="name" placeholder="Ms. Rodriguez" required></div>
          <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Get Started</button>
        </form>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--text-muted);font-size:0.8rem;">
        <span style="flex:1;height:1px;background:var(--border)"></span>or try a demo<span style="flex:1;height:1px;background:var(--border)"></span>
      </div>
      <button class="btn btn-secondary btn-block" data-action="load-demo">🚀 Load Demo Classroom</button>
    </div>
  </div>`;

// ============================================================
// VIEW: DASHBOARD
// ============================================================
const viewDashboard = () => {
  const students = DB.load().students;
  const observations = DB.load().observations;
  const todayObs = observations.filter(o => Date.now()-new Date(o.timestamp).getTime() < 86400000);
  const needAttention = students.filter(s => Analytics.getAttentionStatus(s.id) === 'overdue');

  return header('ObservationTracker', '', `<span style="font-size:0.82rem;color:var(--text-dim)">${DB.load().teacher?.name}</span>`) + `
  <div class="main-content">
    <div class="dashboard">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-value">${students.length}</div><div class="stat-label">Students</div></div>
        <div class="stat-card"><div class="stat-value">${observations.length}</div><div class="stat-label">Total Obs</div></div>
        <div class="stat-card"><div class="stat-value">${todayObs.length}</div><div class="stat-label">Today</div></div>
        <div class="stat-card"><div class="stat-value" style="color:${needAttention.length>0?'var(--rose)':'var(--accent)'}">${needAttention.length}</div><div class="stat-label">Need Attn</div></div>
      </div>
      ${needAttention.length > 0 ? `<p class="section-title" style="color:var(--rose)">⚠️ Not observed recently</p>
      <div class="student-grid" style="margin-bottom:20px">
        ${needAttention.map(s => studentCard(s)).join('')}
      </div>` : ''}
      <p class="section-title">All Students</p>
      ${students.length === 0 ? `<div class="empty-state"><div class="empty-icon">👥</div><p>No students yet.</p>
        <button class="btn btn-primary" data-action="nav" data-view="add-student">Add Students</button></div>` : `
      <div class="student-grid">
        ${students.map(s => studentCard(s)).join('')}
      </div>`}
    </div>
    <button class="btn-fab" data-action="nav" data-view="log" title="Quick Log">➕</button>
  </div>
  ${bottomNav()}`;
};

const studentCard = (s) => {
  const last = DB.getLastObservation(s.id);
  const attn = Analytics.getAttentionStatus(s.id);
  const goals = DB.getGoals(s.id);
  const initials = s.name.split(' ').map(w=>w[0]).join('');
  return `<div class="student-card" data-action="view-student" data-id="${s.id}">
    <div class="student-avatar">${initials}</div>
    <div class="student-name">${s.name}</div>
    <div class="last-obs">${last ? ago(last.timestamp) : 'No observations'}</div>
    <div class="last-obs">${goals.length} goals</div>
    ${attn==='overdue' ? '<span class="attention-badge overdue">Needs attention</span>' : ''}
    ${attn==='recent' ? '<span class="attention-badge recent">Observed recently</span>' : ''}
  </div>`;
};

// ============================================================
// VIEW: QUICK LOG (multi-step)
// ============================================================
const viewLog = () => {
  const steps = ['Student', 'Goal', 'Rating', 'Note'];
  const stepIndicator = `<div class="log-steps">${steps.map((s,i) => `<div class="log-step ${i===state.logStep?'active':''} ${i<state.logStep?'done':''}"></div>`).join('')}</div>`;

  let body = '';
  if (state.logStep === 0) body = logStepStudent();
  else if (state.logStep === 1) body = logStepGoal();
  else if (state.logStep === 2) body = logStepRating();
  else if (state.logStep === 3) body = logStepNote();

  return header('Quick Log', `<button class="btn btn-ghost btn-sm" data-action="nav" data-view="dashboard">←</button>`) + `
  <div class="main-content">
    <div class="quick-log">
      ${stepIndicator}
      <div class="step-title">${steps[state.logStep]}</div>
      ${body}
    </div>
  </div>
  ${bottomNav()}`;
};

const logStepStudent = () => {
  const students = DB.load().students;
  if (students.length === 0) return `<div class="empty-state"><p>Add students first.</p><button class="btn btn-primary" data-action="nav" data-view="add-student">Add Students</button></div>`;
  return `<div class="student-select-grid">
    ${students.map(s => `<button class="student-chip ${state.logData.studentId===s.id?'selected':''}" data-action="log-select-student" data-id="${s.id}">${s.name.split(' ')[0]}</button>`).join('')}
  </div>`;
};

const logStepGoal = () => {
  const goals = DB.getGoals(state.logData.studentId);
  const student = DB.getStudent(state.logData.studentId);
  if (goals.length === 0) return `<div class="empty-state"><p>No goals set for ${student?.name}.</p>
    <button class="btn btn-primary" data-action="nav" data-view="add-goal" data-student="${state.logData.studentId}">Add Goals</button></div>`;
  return `<div class="goal-select-list">
    ${goals.map(g => `<button class="goal-chip ${state.logData.goalId===g.id?'selected':''}" data-action="log-select-goal" data-id="${g.id}">
      <div class="goal-area">${g.area}</div>${g.description}
    </button>`).join('')}
  </div>`;
};

const logStepRating = () => `
  <div class="rating-buttons">
    ${[1,2,3,4].map(r => `<button class="rating-btn ${state.logData.rating===r?'selected':''}" data-action="log-select-rating" data-rating="${r}">${RATING_EMOJI[r]}</button>`).join('')}
  </div>
  <div class="rating-labels">
    ${[1,2,3,4].map(r => `<span>${RATING_LABELS[r]}</span>`).join('')}
  </div>`;

const logStepNote = () => {
  const student = DB.getStudent(state.logData.studentId);
  const goal = DB.getGoalById(state.logData.goalId);
  return `<div style="margin-bottom:16px;padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);font-size:0.85rem;">
    <strong>${student?.name}</strong> \u2022 ${goal?.description || ''}<br>
    <span style="color:${['','var(--rose)','var(--amber)','var(--blue)','var(--accent)'][state.logData.rating]}">${RATING_EMOJI[state.logData.rating]} ${RATING_LABELS[state.logData.rating]}</span>
  </div>
  <form data-form="save-observation">
    <div class="form-group">
      <textarea name="note" placeholder="Quick note (optional)... what did you observe?" rows="3">${state.logData.note}</textarea>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary btn-block btn-lg" type="submit">✅ Save Observation</button>
    </div>
  </form>
  <button class="btn btn-ghost btn-block btn-sm" data-action="log-back" style="margin-top:8px;">← Back</button>`;
};

// ============================================================
// VIEW: TIMELINE
// ============================================================
const viewTimeline = () => {
  const recent = DB.getRecentObservations(30);
  return header('Timeline') + `
  <div class="main-content">
    <div class="timeline">
      ${recent.length === 0 ? '<div class="empty-state"><div class="empty-icon">📝</div><p>No observations yet.</p></div>' : ''}
      ${recent.map(o => {
        const s = DB.getStudent(o.studentId);
        const g = DB.getGoalById(o.goalId);
        return `<div class="timeline-item">
          <div class="timeline-dot r${o.rating}"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-student" data-action="view-student" data-id="${o.studentId}" style="cursor:pointer">${s?.name||'?'}</span>
              <span class="timeline-time">${ago(o.timestamp)}</span>
            </div>
            <div class="timeline-goal">${g?.description||''}</div>
            ${o.note ? `<div class="timeline-note">${o.note}</div>` : ''}
            <span class="timeline-rating r${o.rating}">${RATING_LABELS[o.rating]}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: STUDENT PROFILE
// ============================================================
const viewStudent = () => {
  const s = DB.getStudent(state.viewParams.id);
  if (!s) return '';
  const goals = DB.getGoals(s.id);
  const allObs = DB.getObservations(s.id);
  const initials = s.name.split(' ').map(w=>w[0]).join('');

  return header(s.name, `<button class="btn btn-ghost btn-sm" data-action="nav" data-view="dashboard">←</button>`,
    `<button class="btn btn-sm btn-primary" data-action="nav" data-view="report" data-student="${s.id}">📝 Report</button>`) + `
  <div class="main-content">
    <div class="profile">
      <div class="profile-header">
        <div class="profile-avatar">${initials}</div>
        <div class="profile-info">
          <h2>${s.name}</h2>
          <p>${s.grade || ''} \u2022 ${allObs.length} observations \u2022 ${goals.length} goals</p>
        </div>
      </div>
      <p class="section-title">IEP Goals & Progress</p>
      ${goals.length === 0 ? `<div class="empty-state"><p>No goals set.</p><button class="btn btn-primary btn-sm" data-action="nav" data-view="add-goal" data-student="${s.id}">Add Goal</button></div>` : ''}
      ${goals.map(g => {
        const gObs = DB.getObservations(s.id, g.id).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
        const trend = Analytics.getTrend(gObs);
        const trendLabel = trend==='up'?'↑ Improving':trend==='down'?'↓ Declining':'→ Steady';
        return `<div class="goal-progress-card">
          <div class="goal-progress-header">
            <h4>${g.description}</h4>
            <span class="goal-area-tag ${g.area}">${g.area}</span>
          </div>
          ${gObs.length > 0 ? `
          <div class="mini-chart">
            ${gObs.slice(-10).map(o => `<div class="mini-bar r${o.rating}" style="height:${o.rating*25}%"></div>`).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="goal-obs-count">${gObs.length} observations</span>
            <span class="goal-trend ${trend}">${trendLabel}</span>
          </div>` : `<p style="font-size:0.82rem;color:var(--text-muted);margin-top:8px;">No observations yet</p>`}
          <div style="margin-top:8px;"><button class="btn btn-sm btn-secondary" data-action="quick-log-goal" data-student="${s.id}" data-goal="${g.id}">Log Observation</button></div>
        </div>`;
      }).join('')}
      <button class="btn btn-secondary btn-sm" data-action="nav" data-view="add-goal" data-student="${s.id}" style="margin-top:12px;">➕ Add Goal</button>

      ${allObs.length > 0 ? `
      <p class="section-title" style="margin-top:24px;">Recent Observations</p>
      ${allObs.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,10).map(o => {
        const g = DB.getGoalById(o.goalId);
        return `<div class="timeline-item" style="border-bottom:1px solid var(--border);">
          <div class="timeline-dot r${o.rating}"></div>
          <div class="timeline-content">
            <div class="timeline-header"><span class="timeline-goal">${g?.description?.slice(0,50)||''}</span><span class="timeline-time">${ago(o.timestamp)}</span></div>
            ${o.note ? `<div class="timeline-note">${o.note}</div>` : ''}
            <span class="timeline-rating r${o.rating}">${RATING_LABELS[o.rating]}</span>
          </div>
        </div>`;
      }).join('')}` : ''}
    </div>
    <button class="btn-fab" data-action="quick-log-student" data-student="${s.id}" title="Log observation">➕</button>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: REPORT
// ============================================================
const viewReport = () => {
  const s = DB.getStudent(state.viewParams.studentId);
  if (!s) return '';
  const goals = DB.getGoals(s.id);
  const obs = DB.getObservations(s.id);
  const report = AIReport.generateMockReport(s, goals, obs);

  return header('Progress Report', `<button class="btn btn-ghost btn-sm" data-action="view-student" data-id="${s.id}">← Back</button>`,
    `<button class="btn btn-sm btn-secondary" onclick="window.print()">🖨️ Print</button>`) + `
  <div class="main-content">
    <div class="report">
      <div class="report-card">
        <div class="report-text">${report.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^# (.*)$/gm, '<h2 style="font-size:1.2rem;margin-bottom:8px;">$1</h2>').replace(/^---$/gm, '<hr style="border:0;border-top:1px solid var(--border);margin:16px 0;">').replace(/^\u2022 (.*)$/gm, '<div style="padding-left:12px;margin-bottom:4px;">&bull; $1</div>')}</div>
      </div>
      ${AIReport.getApiKey() ? `<button class="btn btn-primary btn-block" data-action="generate-ai-report" data-student="${s.id}">✨ Generate AI-Enhanced Report</button>` : `
      <div style="text-align:center;margin-top:12px;font-size:0.82rem;color:var(--text-muted);">
        Add an OpenRouter API key in Settings to generate AI-written IEP reports.
      </div>`}
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: MANAGE
// ============================================================
const viewManage = () => {
  return header('Manage') + `
  <div class="main-content">
    <div class="dashboard">
      <button class="btn btn-primary btn-block" data-action="nav" data-view="add-student" style="margin-bottom:12px;">👥 Add Student</button>
      <button class="btn btn-secondary btn-block" data-action="nav" data-view="settings" style="margin-bottom:12px;">⚙️ Settings</button>
      <button class="btn btn-danger btn-block" data-action="reset-data">🗑️ Reset All Data</button>
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: ADD STUDENT
// ============================================================
const viewAddStudent = () => {
  return header('Add Student', `<button class="btn btn-ghost btn-sm" data-action="nav" data-view="manage">←</button>`) + `
  <div class="main-content">
    <div class="dashboard" style="max-width:500px;">
      <form data-form="add-student">
        <div class="form-group"><label>Student Name</label><input name="name" placeholder="First Last" required></div>
        <div class="form-group"><label>Grade</label><input name="grade" placeholder="e.g. 3rd, 4th"></div>
        <div class="form-group"><label>Notes (optional)</label><textarea name="notes" placeholder="Any relevant notes about accommodations, triggers, etc."></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Add Student</button>
      </form>
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: ADD GOAL
// ============================================================
const viewAddGoal = () => {
  const studentId = state.viewParams.studentId;
  const student = DB.getStudent(studentId);
  return header(`Add Goal for ${student?.name||''}`, `<button class="btn btn-ghost btn-sm" data-action="view-student" data-id="${studentId}">←</button>`) + `
  <div class="main-content">
    <div class="dashboard" style="max-width:500px;">
      <form data-form="add-goal">
        <input type="hidden" name="studentId" value="${studentId}">
        <div class="form-group">
          <label>Goal Area</label>
          <select name="area" required>
            ${GOAL_AREAS.map(a => `<option value="${a}">${a.charAt(0).toUpperCase()+a.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Goal Description</label><textarea name="description" placeholder="e.g. Remain seated during instruction for 15+ minutes without prompting" required></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Add Goal</button>
      </form>
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// VIEW: SETTINGS
// ============================================================
const viewSettings = () => {
  return header('Settings', `<button class="btn btn-ghost btn-sm" data-action="nav" data-view="manage">←</button>`) + `
  <div class="main-content">
    <div class="dashboard" style="max-width:500px;">
      <div class="report-card">
        <h3>✨ AI Report Generation</h3>
        <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:12px;">Connect OpenRouter to generate AI-written IEP progress reports from your observations.</p>
        <form data-form="save-settings">
          <div class="form-group"><label>OpenRouter API Key</label>
            <input name="apiKey" type="password" value="${AIReport.getApiKey()}" placeholder="sk-or-...">
          </div>
          <button class="btn btn-primary btn-sm" type="submit">Save</button>
        </form>
      </div>
    </div>
  </div>
  ${bottomNav()}`;
};

// ============================================================
// EVENT HANDLING
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch(action) {
      case 'load-demo': DEMO.load(); state.view = 'dashboard'; render(); break;
      case 'nav': {
        const p = {};
        if (el.dataset.student) p.studentId = el.dataset.student;
        navigate(el.dataset.view, p);
        break;
      }
      case 'view-student': navigate('student', { id: el.dataset.id }); break;
      case 'log-select-student': {
        state.logData.studentId = el.dataset.id;
        state.logStep = 1;
        render();
        break;
      }
      case 'log-select-goal': {
        state.logData.goalId = el.dataset.id;
        state.logStep = 2;
        render();
        break;
      }
      case 'log-select-rating': {
        state.logData.rating = parseInt(el.dataset.rating);
        state.logStep = 3;
        render();
        break;
      }
      case 'log-back': {
        if (state.logStep > 0) { state.logStep--; render(); }
        break;
      }
      case 'quick-log-student': {
        state.logData = { studentId: el.dataset.student, goalId: null, rating: null, note: '' };
        state.logStep = 1;
        state.view = 'log';
        render();
        break;
      }
      case 'quick-log-goal': {
        state.logData = { studentId: el.dataset.student, goalId: el.dataset.goal, rating: null, note: '' };
        state.logStep = 2;
        state.view = 'log';
        render();
        break;
      }
      case 'reset-data': {
        if (confirm('Delete all data?')) {
          DB.reset(); state.view = 'setup'; render();
          toast('Data reset.');
        }
        break;
      }
      case 'generate-ai-report': {
        const sid = el.dataset.student;
        const s = DB.getStudent(sid);
        const goals = DB.getGoals(sid);
        const obs = DB.getObservations(sid);
        el.textContent = 'Generating...';
        el.disabled = true;
        AIReport.generateAIReport(s, goals, obs).then(report => {
          const card = document.querySelector('.report-text');
          if (card) card.innerHTML = report.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
          toast('AI report generated!');
          el.textContent = '\u2728 Regenerate';
          el.disabled = false;
        });
        break;
      }
    }
  });

  app.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    const fd = new FormData(form);

    switch(form.dataset.form) {
      case 'setup': {
        DB.load(); DB.setTeacher(fd.get('name'));
        toast('Welcome, ' + fd.get('name') + '!');
        navigate('dashboard');
        break;
      }
      case 'add-student': {
        DB.addStudent(fd.get('name'), fd.get('grade'), fd.get('notes'));
        toast(fd.get('name') + ' added!');
        form.reset();
        break;
      }
      case 'add-goal': {
        DB.addGoal(fd.get('studentId'), fd.get('area'), fd.get('description'));
        toast('Goal added!');
        navigate('student', { id: fd.get('studentId') });
        break;
      }
      case 'save-observation': {
        state.logData.note = fd.get('note');
        DB.addObservation(state.logData.studentId, state.logData.goalId, state.logData.rating, state.logData.note);
        toast('\u2705 Observation saved!');
        navigate('dashboard');
        break;
      }
      case 'save-settings': {
        AIReport.setApiKey(fd.get('apiKey'));
        toast('Settings saved.');
        break;
      }
    }
  });

  // Check if data exists
  const d = DB.load();
  if (d.teacher) state.view = 'dashboard';
  render();
});
