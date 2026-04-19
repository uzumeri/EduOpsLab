/* ConfusionEngine — Application Logic */
/* Copyright (c) 2026 Mustafa Uzumeri. All rights reserved. */

// ============================================================
// CONFIGURATION
// ============================================================
const STORAGE_KEY = 'confusionEngine';
const GRADE_LABELS = ['None', 'Named', 'Explained', 'Juxtaposed'];
const GRADE_COLORS = ['g0', 'g1', 'g2', 'g3'];
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ============================================================
// UTILITIES
// ============================================================
/** @returns {string} Random 8-char hex ID */
const genId = () => Math.random().toString(36).slice(2, 10);

/** @returns {string} Course join code like OPS-3710 */
const genCode = () => {
  const w = ['OPS','MGT','SCM','ENG','BUS'];
  return w[Math.floor(Math.random()*w.length)] + '-' + Math.floor(1000+Math.random()*9000);
};

/** @param {string} iso - ISO date string @returns {string} Formatted date */
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });
};

/** @param {string} iso @returns {'upcoming'|'open'|'closed'} */
const chapterStatus = (opensAt, closesAt) => {
  const now = Date.now();
  if (new Date(opensAt) > now) return 'upcoming';
  if (new Date(closesAt) < now) return 'closed';
  return 'open';
};

/** Show a toast notification */
const toast = (msg, type='success') => {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ============================================================
// STORAGE
// ============================================================
const DB = {
  _data: null,
  load() {
    if (!this._data) {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? JSON.parse(raw) : { users: [], courses: [] };
    }
    return this._data;
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data)); },
  reset() { localStorage.removeItem(STORAGE_KEY); this._data = null; },

  // Users
  findUser(email, password) {
    return this.load().users.find(u => u.email === email && u.password === password);
  },
  findUserByEmail(email) {
    return this.load().users.find(u => u.email === email);
  },
  createUser(name, email, password, role) {
    const user = { id: genId(), name, email, password, role };
    this.load().users.push(user);
    this.save();
    return user;
  },

  // Courses
  createCourse(name, teacherId) {
    const course = { id: genId(), name, teacherId, code: genCode(), chapters: [], roster: [] };
    this.load().courses.push(course);
    this.save();
    return course;
  },
  getTeacherCourse(teacherId) {
    return this.load().courses.find(c => c.teacherId === teacherId);
  },
  getCourseByCode(code) {
    return this.load().courses.find(c => c.code.toLowerCase() === code.toLowerCase());
  },
  getCourse(id) {
    return this.load().courses.find(c => c.id === id);
  },
  joinCourse(courseId, studentId) {
    const c = this.getCourse(courseId);
    if (c && !c.roster.includes(studentId)) {
      c.roster.push(studentId);
      this.save();
    }
  },
  getStudentCourses(studentId) {
    return this.load().courses.filter(c => c.roster.includes(studentId));
  },

  // Chapters
  addChapter(courseId, title, question, opensAt, closesAt) {
    const ch = { id: genId(), title, question, opensAt, closesAt, responses: [] };
    const c = this.getCourse(courseId);
    c.chapters.push(ch);
    this.save();
    return ch;
  },
  getChapter(courseId, chapterId) {
    const c = this.getCourse(courseId);
    return c ? c.chapters.find(ch => ch.id === chapterId) : null;
  },
  updateChapter(courseId, chapterId, updates) {
    const ch = this.getChapter(courseId, chapterId);
    if (ch) Object.assign(ch, updates);
    this.save();
  },

  // Responses
  submitResponse(courseId, chapterId, studentId, text) {
    const ch = this.getChapter(courseId, chapterId);
    if (!ch) return;
    let resp = ch.responses.find(r => r.studentId === studentId);
    if (resp) {
      resp.text = text;
      resp.updatedAt = new Date().toISOString();
    } else {
      ch.responses.push({ studentId, text, submittedAt: new Date().toISOString(), updatedAt: null, grade: null, aiGrade: null, aiRationale: null });
    }
    this.save();
  },
  getResponse(courseId, chapterId, studentId) {
    const ch = this.getChapter(courseId, chapterId);
    return ch ? ch.responses.find(r => r.studentId === studentId) : null;
  },
  gradeResponse(courseId, chapterId, studentId, grade) {
    const resp = this.getResponse(courseId, chapterId, studentId);
    if (resp) { resp.grade = grade; this.save(); }
  },
  setAISuggestion(courseId, chapterId, studentId, aiGrade, aiRationale) {
    const resp = this.getResponse(courseId, chapterId, studentId);
    if (resp) { resp.aiGrade = aiGrade; resp.aiRationale = aiRationale; this.save(); }
  }
};

// ============================================================
// STATE
// ============================================================
const state = {
  user: null,
  courseId: null,
  view: 'login',
  viewParams: {},
  gradingIndex: 0,
  gradingMode: 'manual'
};

// ============================================================
// DEMO DATA
// ============================================================
const DEMO = {
  load() {
    DB.reset();
    const teacher = DB.createUser('Prof. Uzumeri', 'prof@auburn.edu', 'demo', 'teacher');
    const course = DB.createCourse('SCMH 3710: Operations Management', teacher.id);

    const students = [
      'Sarah Chen', 'Marcus Johnson', 'Priya Patel', 'James Williams',
      'Sofia Rodriguez', 'David Kim', 'Emma Thompson', 'Luis Garcia',
      'Aisha Mohammed', 'Ryan O\'Brien'
    ].map((name, i) => {
      const s = DB.createUser(name, `student${i+1}@auburn.edu`, 'demo', 'student');
      DB.joinCourse(course.id, s.id);
      return s;
    });

    const now = new Date();
    const past = (d) => new Date(now.getTime() - d*86400000).toISOString();
    const future = (d) => new Date(now.getTime() + d*86400000).toISOString();

    // Ch1: fully graded
    const ch1 = DB.addChapter(course.id, 'Chapter 3: Process Analysis & Bottlenecks', 'What in this reading confused you?', past(14), past(7));
    const ch1responses = [
      { idx:0, text:'The reading says the bottleneck determines system throughput, but then shows an example where improving a non-bottleneck step actually improved the whole system. If only the bottleneck matters, why did fixing something else help?', g:3, ag:3, ar:'Juxtaposes the bottleneck principle with a contradictory example from the text \u2014 identifies a genuine tension the reading doesn\'t resolve.' },
      { idx:1, text:'I don\'t understand how to calculate throughput when there are parallel paths. The formula assumes sequential steps but the example has simultaneous operations.', g:2, ag:2, ar:'Explains the specific point of confusion clearly \u2014 the mismatch between the sequential formula and the parallel example.' },
      { idx:2, text:'Bottleneck analysis was confusing.', g:1, ag:1, ar:'Names the topic but does not explain what specifically was confusing about it.' },
      { idx:3, text:'The chapter says increasing capacity at the bottleneck always helps, but earlier we read that adding workers has diminishing returns. So does adding capacity help or not? Depends on what kind of capacity?', g:3, ag:3, ar:'Juxtaposes two principles from different sections \u2014 bottleneck elevation vs. diminishing returns \u2014 and identifies the unresolved question.' },
      { idx:4, text:'I understood everything fine.', g:0, ag:0, ar:'No substantive confusion reported.' },
      { idx:5, text:'Process analysis seems straightforward but I got lost when the reading started talking about utilization vs. throughput. Aren\'t they the same thing? High utilization should mean high throughput but the reading suggests otherwise.', g:2, ag:3, ar:'Juxtaposes utilization and throughput as concepts that seem equivalent but are distinguished in the reading.' },
      { idx:6, text:'The math examples were hard to follow, especially the one with the conveyor system.', g:1, ag:1, ar:'Names the confusing section but doesn\'t explain what about the math was unclear.' },
      { idx:7, text:'', g:0, ag:0, ar:'No response submitted.' },
      { idx:8, text:'I was confused about cycle time versus processing time. The reading uses both terms and they seem similar but the calculations treat them differently. I think cycle time includes waiting but I\'m not sure.', g:2, ag:2, ar:'Explains confusion about the distinction between two specific terms and attempts a hypothesis about the difference.' },
      { idx:9, text:'The bottleneck stuff.', g:1, ag:1, ar:'Names the topic area without further elaboration.' }
    ];
    ch1responses.forEach(r => {
      DB.submitResponse(course.id, ch1.id, students[r.idx].id, r.text);
      DB.gradeResponse(course.id, ch1.id, students[r.idx].id, r.g);
      DB.setAISuggestion(course.id, ch1.id, students[r.idx].id, r.ag, r.ar);
    });

    // Ch2: responses but ungraded
    const ch2 = DB.addChapter(course.id, 'Chapter 5: Queuing Theory', 'What in this reading confused you?', past(7), past(1));
    const ch2responses = [
      { idx:0, text:'The reading says adding a second server cuts wait time by more than half, but in the hospital example they added two extra triage nurses and wait times barely changed. If the theory says more servers always help, why didn\'t it work there?', ag:3, ar:'Juxtaposes the general M/M/c theory with the hospital case study \u2014 identifies a tension between theoretical prediction and observed outcome.' },
      { idx:1, text:'I don\'t understand why utilization has to stay below 100% for the system to be stable. In a factory you\'d want machines at full capacity. The math shows wait times going to infinity as utilization approaches 1, but I can\'t intuitively see why.', ag:2, ar:'Explains a specific conceptual difficulty with the stability condition and contrasts it with manufacturing intuition.' },
      { idx:2, text:'The queuing formulas were really confusing.', ag:1, ar:'Names the confusing element without specifying what about the formulas was unclear.' },
      { idx:3, text:'I was confused by the Poisson arrival assumption. Real arrivals cluster \u2014 the lunch rush, the Monday morning spike. How can we use a model that assumes randomness when arrivals are clearly patterned?', ag:3, ar:'Juxtaposes the theoretical Poisson assumption with observable real-world arrival patterns \u2014 questions the model\'s validity.' },
      { idx:4, text:'', ag:0, ar:'No response submitted.' },
      { idx:5, text:'The difference between single-queue and multi-queue systems. The reading says a single queue is always better if servers are identical, but every grocery store uses multiple queues. There must be a reason.', ag:3, ar:'Juxtaposes the theoretical optimality of single-queue with the observed practice of multi-queue systems \u2014 infers a missing explanation.' },
      { idx:6, text:'Wait time calculations confused me, especially with multiple servers.', ag:1, ar:'Names the topic area without explaining the specific source of confusion.' },
      { idx:7, text:'I think I understood it but the notation was hard to track. M/M/1, M/M/c \u2014 what do the letters stand for and why does it matter?', ag:2, ar:'Explains confusion about the Kendall notation system and why the distinctions matter.' },
      { idx:8, text:'Everything was clear.', ag:0, ar:'No substantive confusion reported.' },
      { idx:9, text:'The section on Little\'s Law felt circular \u2014 L equals lambda times W. But doesn\'t the arrival rate determine both the queue length and the wait? It feels like saying "the line is long because there are a lot of people" which is obvious, not a law.', ag:3, ar:'Challenges the apparent circularity of Little\'s Law \u2014 questions whether it\'s genuinely informative or merely tautological.' }
    ];
    ch2responses.forEach(r => {
      DB.submitResponse(course.id, ch2.id, students[r.idx].id, r.text);
      DB.setAISuggestion(course.id, ch2.id, students[r.idx].id, r.ag, r.ar);
    });

    // Ch3: currently open
    const ch3 = DB.addChapter(course.id, 'Chapter 7: Inventory Management', 'What in this reading confused you?', past(1), future(3));
    // Partial responses
    [0,1,3,5].forEach(idx => {
      const texts = [
        'The EOQ formula assumes constant demand but everything I\'ve read about real supply chains says demand is variable. Is EOQ just a simplification that nobody actually uses?',
        'Safety stock calculations \u2014 why use a normal distribution for demand when demand often has fat tails?',
        'The reading says JIT eliminates waste by removing buffers, but we just learned safety stock protects against variability. Which is right?',
        'Holding costs vs ordering costs tradeoff \u2014 I follow the math but don\'t understand why anyone would choose to order less frequently when it means tying up cash in inventory.'
      ];
      const ags = [3,2,3,2];
      const ars = [
        'Juxtaposes the EOQ constant-demand assumption with the reality of variable demand \u2014 questions practical applicability.',
        'Questions the distributional assumption underlying safety stock calculations \u2014 a valid statistical concern.',
        'Juxtaposes JIT\'s buffer-elimination philosophy with the safety stock rationale from earlier \u2014 identifies a fundamental tension.',
        'Follows the math but questions the business logic \u2014 explains why the tradeoff doesn\'t intuitively make sense.'
      ];
      const i = [0,1,3,5].indexOf(idx);
      DB.submitResponse(course.id, ch3.id, students[idx].id, texts[i]);
      DB.setAISuggestion(course.id, ch3.id, students[idx].id, ags[i], ars[i]);
    });

    // Ch4: upcoming
    DB.addChapter(course.id, 'Chapter 9: Supply Chain Coordination', 'What in this reading confused you?', future(5), future(10));

    return { teacher, course };
  }
};

// ============================================================
// AI GRADING
// ============================================================
const AIGrader = {
  getApiKey() { return localStorage.getItem('ce_openrouter_key') || ''; },
  setApiKey(key) { localStorage.setItem('ce_openrouter_key', key); },
  getModel() { return localStorage.getItem('ce_openrouter_model') || 'mistralai/mistral-7b-instruct:free'; },
  setModel(m) { localStorage.setItem('ce_openrouter_model', m); },

  async grade(responseText, question, chapterTitle) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.getModel(),
          messages: [{
            role: 'system',
            content: `You are grading a student's response to this homework question about "${chapterTitle}": "${question}"

Grade on this scale:
0 = No substantive answer (blank, "nothing" or "I understood everything")
1 = Named something confusing but didn't explain why
2 = Explained what was confusing and why
3 = Juxtaposed two ideas in tension (from within the text, or between the text and reality)

Respond ONLY in this exact JSON format:
{"grade": <0-3>, "rationale": "<one sentence explanation>"}`
          }, {
            role: 'user',
            content: responseText || '(no response submitted)'
          }],
          temperature: 0.3,
          max_tokens: 150
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(content);
      return { grade: parsed.grade, rationale: parsed.rationale };
    } catch (e) {
      console.error('AI grading error:', e);
      return null;
    }
  }
};

// ============================================================
// ROUTER
// ============================================================
const navigate = (view, params = {}) => {
  state.view = view;
  state.viewParams = params;
  render();
};

const render = () => {
  const app = document.getElementById('app');
  const views = {
    'login': viewLogin,
    'teacher-dashboard': viewTeacherDashboard,
    'chapter-form': viewChapterForm,
    'grading': viewGrading,
    'summary': viewSummary,
    'roster': viewRoster,
    'settings': viewSettings,
    'student-dashboard': viewStudentDashboard,
    'student-response': viewStudentResponse,
    'join-course': viewJoinCourse
  };
  const fn = views[state.view] || viewLogin;
  app.innerHTML = fn();
  if (state.view === 'grading') setupGradingKeys();
};

// ============================================================
// HEADER
// ============================================================
const headerHTML = (title, actions = '') => `
  <header class="app-header">
    <h1>🤔 ${title}</h1>
    <div class="header-actions">
      <span class="header-user">${state.user?.name || ''}</span>
      ${actions}
      <button class="btn btn-ghost btn-sm" data-action="logout">Logout</button>
    </div>
  </header>`;

// ============================================================
// VIEW: LOGIN
// ============================================================
const viewLogin = () => `
  <div class="login-wrapper">
    <div class="login-box">
      <div class="logo">🤔</div>
      <h1>ConfusionEngine</h1>
      <p class="tagline">Confusion is a higher state of knowledge than ignorance.</p>
      <div class="role-tabs">
        <button class="role-tab active" data-action="show-tab" data-tab="teacher">Teacher</button>
        <button class="role-tab" data-action="show-tab" data-tab="student">Student</button>
      </div>
      <div id="login-form-area">
        ${loginFormHTML('teacher')}
      </div>
      <div class="demo-divider">or try a demo</div>
      <button class="btn btn-secondary btn-block" data-action="load-demo">🚀 Load Demo Course</button>
    </div>
  </div>`;

const loginFormHTML = (role) => {
  if (role === 'teacher') return `
    <form class="login-form" data-form="teacher-login">
      <h2>Teacher Sign In</h2>
      <div class="form-group"><label>Name</label><input name="name" placeholder="Your name" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" placeholder="you@university.edu" required></div>
      <div class="form-group"><label>Password</label><input name="password" type="password" placeholder="Password" required></div>
      <button class="btn btn-primary btn-block" type="submit">Sign In / Register</button>
    </form>`;
  return `
    <form class="login-form" data-form="student-login">
      <h2>Student Sign In</h2>
      <div class="form-group"><label>Course Code</label><input name="code" placeholder="e.g. OPS-3710" required></div>
      <div class="form-group"><label>Name</label><input name="name" placeholder="Your name" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" placeholder="you@university.edu" required></div>
      <div class="form-group"><label>Password</label><input name="password" type="password" placeholder="Password" required></div>
      <button class="btn btn-primary btn-block" type="submit">Join Course</button>
    </form>`;
};

// ============================================================
// VIEW: TEACHER DASHBOARD
// ============================================================
const viewTeacherDashboard = () => {
  const course = DB.getTeacherCourse(state.user.id);
  if (!course) return headerHTML('ConfusionEngine') + `
    <div class="dashboard">
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>Create your first course to get started.</p>
        <form data-form="create-course" style="max-width:400px;margin:0 auto;">
          <div class="form-group"><input name="name" placeholder="Course name, e.g. SCMH 3710: Operations Management" required></div>
          <button class="btn btn-primary" type="submit">Create Course</button>
        </form>
      </div>
    </div>`;

  state.courseId = course.id;
  const rosterCount = course.roster.length;
  const chapters = course.chapters;

  return headerHTML('ConfusionEngine', `
    <button class="btn btn-ghost btn-sm" data-action="go-roster">👥 Roster (${rosterCount})</button>
    <button class="btn btn-ghost btn-sm" data-action="go-settings">⚙️ Settings</button>
  `) + `
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h2>${course.name}</h2>
        <div class="course-code" title="Share this code with students">🔑 ${course.code}</div>
      </div>
      <button class="btn btn-primary" data-action="add-chapter">➕ New Chapter</button>
    </div>
    ${chapters.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No chapters yet. Add your first reading assignment.</p>
      </div>` : `
      <div class="chapter-list">
        ${chapters.map(ch => {
          const status = chapterStatus(ch.opensAt, ch.closesAt);
          const responded = ch.responses.length;
          const graded = ch.responses.filter(r => r.grade !== null).length;
          const total = rosterCount;
          const avgGrade = graded > 0 ? (ch.responses.filter(r=>r.grade!==null).reduce((s,r)=>s+r.grade,0)/graded).toFixed(1) : '--';
          return `
          <div class="chapter-card">
            <div class="chapter-info">
              <h3>${ch.title}</h3>
              <div class="chapter-question">${ch.question}</div>
              <div class="chapter-meta">
                <span class="status-badge status-${status}">${status}</span>
                <span>📝 ${responded}/${total} responded</span>
                <span>✅ ${graded}/${responded} graded</span>
                <span>Avg: ${avgGrade}</span>
                <span>${fmtDate(ch.opensAt)} \u2013 ${fmtDate(ch.closesAt)}</span>
              </div>
            </div>
            <div class="chapter-actions">
              ${status !== 'upcoming' && responded > 0 ? `<button class="btn btn-primary btn-sm" data-action="grade-chapter" data-chapter="${ch.id}">Grade</button>` : ''}
              ${graded > 0 ? `<button class="btn btn-secondary btn-sm" data-action="view-summary" data-chapter="${ch.id}">Summary</button>` : ''}
              <button class="btn btn-ghost btn-sm" data-action="edit-chapter" data-chapter="${ch.id}">✏️</button>
            </div>
          </div>`;
        }).join('')}
      </div>`
    }
  </div>`;
};

// ============================================================
// VIEW: CHAPTER FORM
// ============================================================
const viewChapterForm = () => {
  const ch = state.viewParams.chapterId ? DB.getChapter(state.courseId, state.viewParams.chapterId) : null;
  const isEdit = !!ch;
  const defOpen = new Date(Date.now() + 86400000).toISOString().slice(0,16);
  const defClose = new Date(Date.now() + 8*86400000).toISOString().slice(0,16);
  return headerHTML(isEdit ? 'Edit Chapter' : 'New Chapter', `<button class="btn btn-ghost btn-sm" data-action="go-dashboard">← Back</button>`) + `
  <div class="dashboard">
    <form data-form="save-chapter" style="max-width:600px;">
      <input type="hidden" name="chapterId" value="${ch?.id || ''}">
      <div class="form-group">
        <label>Chapter Title</label>
        <input name="title" value="${ch?.title || ''}" placeholder="e.g. Chapter 5: Queuing Theory" required>
      </div>
      <div class="form-group">
        <label>Question</label>
        <textarea name="question" required>${ch?.question || 'What in this reading confused you?'}</textarea>
        <div class="form-hint">The default question works well. Customize only if you have a specific reason.</div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Opens At</label>
          <input type="datetime-local" name="opensAt" value="${ch ? ch.opensAt.slice(0,16) : defOpen}" required>
        </div>
        <div class="form-group">
          <label>Closes At</label>
          <input type="datetime-local" name="closesAt" value="${ch ? ch.closesAt.slice(0,16) : defClose}" required>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:24px;">
        <button class="btn btn-primary" type="submit">${isEdit ? 'Save Changes' : 'Create Chapter'}</button>
        <button class="btn btn-secondary" type="button" data-action="go-dashboard">Cancel</button>
      </div>
    </form>
  </div>`;
};

// ============================================================
// VIEW: GRADING SCREEN
// ============================================================
const viewGrading = () => {
  const ch = DB.getChapter(state.courseId, state.viewParams.chapterId);
  if (!ch) return '';
  const responses = ch.responses;
  const ungradedOnly = state.viewParams.ungradedOnly !== false;
  const items = ungradedOnly ? responses.filter(r => r.grade === null) : responses;
  const totalGraded = responses.filter(r => r.grade !== null).length;
  const idx = state.gradingIndex;

  let cardHTML = '';
  if (items.length === 0 || idx >= items.length) {
    cardHTML = `<div class="grading-done">
      <h2>✅ All Done!</h2>
      <p>${totalGraded} of ${responses.length} responses graded.</p>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button class="btn btn-primary" data-action="view-summary" data-chapter="${ch.id}">View Summary</button>
        <button class="btn btn-secondary" data-action="go-dashboard">Dashboard</button>
      </div>
    </div>`;
  } else {
    const r = items[idx];
    const student = DB.load().users.find(u => u.id === r.studentId);
    const isEmpty = !r.text || r.text.trim() === '';
    const showAI = state.gradingMode === 'ai-assisted' && r.aiGrade !== null;
    const suggestedGrade = showAI ? r.aiGrade : null;

    cardHTML = `
      <div class="grading-card-wrapper">
        <div class="grading-card" id="grading-card">
          <div class="grading-student">${student?.name || 'Unknown'}</div>
          <div class="grading-response ${isEmpty ? 'empty' : ''}">${isEmpty ? '(No response submitted)' : r.text}</div>
          ${showAI ? `
          <div class="ai-suggestion">
            <div class="ai-label">✨ AI Suggestion</div>
            <div><span class="ai-grade grade-pill ${GRADE_COLORS[r.aiGrade]}"> ${r.aiGrade}</span> ${r.aiRationale || ''}</div>
          </div>` : ''}
        </div>
        <div class="grade-buttons">
          ${[0,1,2,3].map(g => `
            <button class="grade-btn ${suggestedGrade === g ? 'suggested' : ''}" data-action="grade" data-grade="${g}" data-student="${r.studentId}" data-chapter="${ch.id}">
              ${g}
              <span class="grade-label">${GRADE_LABELS[g]}</span>
            </button>`).join('')}
        </div>
        <div class="keyboard-hint">
          Press <kbd>0</kbd> <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> to grade &middot; <kbd>←</kbd> previous &middot; <kbd>S</kbd> skip
        </div>
        <div class="grading-nav">
          <button class="btn btn-ghost btn-sm" data-action="grade-prev" ${idx === 0 ? 'disabled' : ''}>◀ Previous</button>
          <button class="btn btn-ghost btn-sm" data-action="grade-skip">Skip ▶</button>
        </div>
      </div>`;
  }

  const pct = responses.length > 0 ? Math.round(totalGraded / responses.length * 100) : 0;
  return headerHTML(ch.title, `<button class="btn btn-ghost btn-sm" data-action="go-dashboard">End Session</button>`) + `
  <div class="grading-screen">
    <div class="grading-topbar">
      <div class="grading-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span>${totalGraded} / ${responses.length} graded</span>
      </div>
      <div class="mode-toggle">
        <button class="mode-btn ${state.gradingMode==='manual'?'active':''}" data-action="set-mode" data-mode="manual">Manual</button>
        <button class="mode-btn ${state.gradingMode==='ai-assisted'?'active':''}" data-action="set-mode" data-mode="ai-assisted">✨ AI-Assisted</button>
      </div>
    </div>
    <div class="grading-body">
      ${cardHTML}
    </div>
  </div>`;
};

/** Set up keyboard shortcuts for grading screen */
const setupGradingKeys = () => {
  // Remove old handler if exists
  if (window._gradingKeyHandler) document.removeEventListener('keydown', window._gradingKeyHandler);
  window._gradingKeyHandler = (e) => {
    if (state.view !== 'grading') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (['0','1','2','3'].includes(e.key)) {
      const btn = document.querySelector(`.grade-btn[data-grade="${e.key}"]`);
      if (btn) btn.click();
    } else if (e.key === 'ArrowLeft') {
      const btn = document.querySelector('[data-action="grade-prev"]');
      if (btn && !btn.disabled) btn.click();
    } else if (e.key.toLowerCase() === 's') {
      const btn = document.querySelector('[data-action="grade-skip"]');
      if (btn) btn.click();
    }
  };
  document.addEventListener('keydown', window._gradingKeyHandler);
};

// ============================================================
// VIEW: SUMMARY
// ============================================================
const viewSummary = () => {
  const ch = DB.getChapter(state.courseId, state.viewParams.chapterId);
  if (!ch) return '';
  const responses = ch.responses;
  const graded = responses.filter(r => r.grade !== null);
  const counts = [0,1,2,3].map(g => graded.filter(r => r.grade === g).length);
  const total = graded.length;
  const mean = total > 0 ? (graded.reduce((s,r)=>s+r.grade,0)/total).toFixed(2) : '--';
  const maxCount = Math.max(...counts, 1);
  const users = DB.load().users;

  return headerHTML('Summary: ' + ch.title, `
    <button class="btn btn-ghost btn-sm" data-action="go-dashboard">← Back</button>
    <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print</button>
  `) + `
  <div class="summary">
    <h2>Pre-Class Briefing</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Graded</div></div>
      <div class="stat-card"><div class="stat-value">${responses.length - total}</div><div class="stat-label">Ungraded</div></div>
      <div class="stat-card"><div class="stat-value">${mean}</div><div class="stat-label">Mean Grade</div></div>
      <div class="stat-card"><div class="stat-value">${counts[3]}</div><div class="stat-label">Juxtapositions</div></div>
    </div>
    <h3 class="section-title">Grade Distribution</h3>
    <div class="grade-chart">
      ${[0,1,2,3].map(g => {
        const h = maxCount > 0 ? Math.round(counts[g]/maxCount*100) : 0;
        return `<div class="chart-bar-group">
          <div class="chart-bar-count" style="color:var(--g${g})">${counts[g]}</div>
          <div class="chart-bar" style="height:${Math.max(h,2)}%;background:var(--g${g})"></div>
          <div class="chart-bar-label">${g} - ${GRADE_LABELS[g]}</div>
        </div>`;
      }).join('')}
    </div>
    ${counts[3] > 0 ? `
    <h3 class="section-title">⭐ Best Responses (Grade 3 \u2014 Juxtapositions)</h3>
    ${graded.filter(r=>r.grade===3).map(r => {
      const u = users.find(u=>u.id===r.studentId);
      return `<div class="chapter-card" style="margin-bottom:12px;">
        <div class="chapter-info">
          <h3 style="font-size:0.9rem;color:var(--text-dim)">${u?.name||'Unknown'}</h3>
          <div style="margin-top:6px;line-height:1.6">${r.text}</div>
        </div>
        <span class="grade-pill g3">3</span>
      </div>`;
    }).join('')}` : ''}
    ${counts[0] > 0 ? `
    <h3 class="section-title">⚠\ufe0f No Response / No Engagement (Grade 0)</h3>
    <div class="roster-list">
      ${graded.filter(r=>r.grade===0).map(r => {
        const u = users.find(u=>u.id===r.studentId);
        return `<div class="roster-item"><span class="student-name">${u?.name||'Unknown'}</span><span class="grade-pill g0">0</span></div>`;
      }).join('')}
    </div>` : ''}
    <h3 class="section-title" style="margin-top:32px;">All Responses</h3>
    <table class="response-table">
      <thead><tr><th>Student</th><th>Response</th><th>Grade</th></tr></thead>
      <tbody>
        ${responses.map(r => {
          const u = users.find(u=>u.id===r.studentId);
          const gClass = r.grade !== null ? GRADE_COLORS[r.grade] : '';
          return `<tr>
            <td>${u?.name||'Unknown'}</td>
            <td class="response-text-cell">${r.text || '<em style="color:var(--text-muted)">(no response)</em>'}</td>
            <td>${r.grade !== null ? `<span class="grade-pill ${gClass}">${r.grade}</span>` : '<span style="color:var(--text-muted)">\u2014</span>'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
};

// ============================================================
// VIEW: ROSTER
// ============================================================
const viewRoster = () => {
  const course = DB.getCourse(state.courseId);
  const users = DB.load().users;
  const students = course.roster.map(id => users.find(u => u.id === id)).filter(Boolean);
  return headerHTML('Student Roster', `<button class="btn btn-ghost btn-sm" data-action="go-dashboard">← Back</button>`) + `
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>${students.length} Students Enrolled</h2>
      <div class="course-code">🔑 Share code: ${course.code}</div>
    </div>
    ${students.length === 0 ? `<div class="empty-state"><p>No students enrolled yet. Share the course code with your students.</p></div>` : `
    <div class="roster-list">
      ${students.map(s => `<div class="roster-item"><span class="student-name">${s.name}</span><span class="student-email">${s.email}</span></div>`).join('')}
    </div>`}
  </div>`;
};

// ============================================================
// VIEW: SETTINGS
// ============================================================
const viewSettings = () => {
  return headerHTML('Settings', `<button class="btn btn-ghost btn-sm" data-action="go-dashboard">← Back</button>`) + `
  <div class="dashboard" style="max-width:600px;">
    <div class="settings-card">
      <h3>✨ AI-Assisted Grading</h3>
      <p style="color:var(--text-dim);font-size:0.88rem;margin-bottom:16px;">Connect an OpenRouter API key to enable AI grade suggestions. The AI suggests a grade and rationale; you confirm or override.</p>
      <form data-form="save-settings">
        <div class="form-group">
          <label>OpenRouter API Key</label>
          <input name="apiKey" type="password" value="${AIGrader.getApiKey()}" placeholder="sk-or-...">
          <div class="form-hint">Get a free key at <a href="https://openrouter.ai" target="_blank">openrouter.ai</a></div>
        </div>
        <div class="form-group">
          <label>Model</label>
          <input name="model" value="${AIGrader.getModel()}" placeholder="mistralai/mistral-7b-instruct:free">
          <div class="form-hint">Free models: mistralai/mistral-7b-instruct:free, huggingfaceh4/zephyr-7b-beta:free</div>
        </div>
        <button class="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
    <div class="settings-card">
      <h3>🗑\ufe0f Data Management</h3>
      <p style="color:var(--text-dim);font-size:0.88rem;margin-bottom:16px;">All data is stored locally in your browser.</p>
      <button class="btn btn-danger" data-action="reset-data">Reset All Data</button>
    </div>
  </div>`;
};

// ============================================================
// VIEW: STUDENT DASHBOARD
// ============================================================
const viewStudentDashboard = () => {
  const courses = DB.getStudentCourses(state.user.id);
  if (courses.length === 0) return headerHTML('ConfusionEngine') + `
    <div class="dashboard">
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <p>You haven't joined any courses yet.</p>
        <button class="btn btn-primary" data-action="go-join">Join a Course</button>
      </div>
    </div>`;

  const course = courses[0];
  state.courseId = course.id;
  const now = Date.now();
  const chapters = course.chapters;
  const active = chapters.filter(ch => chapterStatus(ch.opensAt, ch.closesAt) === 'open');
  const upcoming = chapters.filter(ch => chapterStatus(ch.opensAt, ch.closesAt) === 'upcoming');
  const past = chapters.filter(ch => chapterStatus(ch.opensAt, ch.closesAt) === 'closed');

  const chapterCard = (ch, showGrade = false) => {
    const status = chapterStatus(ch.opensAt, ch.closesAt);
    const resp = ch.responses.find(r => r.studentId === state.user.id);
    const hasResponse = resp && resp.text;
    return `
    <div class="assignment-card" data-action="open-chapter" data-chapter="${ch.id}" data-course="${course.id}">
      <h3>${ch.title}</h3>
      <div class="assignment-meta">
        <span class="status-badge status-${status}">${status}</span>
        ${status === 'open' ? `<span>Due: ${fmtDate(ch.closesAt)}</span>` : `<span>${fmtDate(ch.closesAt)}</span>`}
        ${hasResponse ? '<span>\u2705 Submitted</span>' : (status === 'open' ? '<span>\u270f\ufe0f Not yet answered</span>' : '')}
        ${showGrade && resp?.grade !== null ? `<span>Grade: <span class="grade-pill ${GRADE_COLORS[resp.grade]}">${resp.grade}</span></span>` : ''}
      </div>
    </div>`;
  };

  return headerHTML(course.name) + `
  <div class="dashboard">
    ${active.length > 0 ? `
      <h3 class="section-title">🟢 Active Assignments</h3>
      ${active.map(ch => chapterCard(ch)).join('')}
    ` : ''}
    ${upcoming.length > 0 ? `
      <h3 class="section-title" style="margin-top:24px;">🔵 Upcoming</h3>
      ${upcoming.map(ch => chapterCard(ch)).join('')}
    ` : ''}
    ${past.length > 0 ? `
      <h3 class="section-title" style="margin-top:24px;">⭕ Past</h3>
      ${past.map(ch => chapterCard(ch, true)).join('')}
    ` : ''}
    ${chapters.length === 0 ? `<div class="empty-state"><p>No assignments yet. Check back soon.</p></div>` : ''}
  </div>`;
};

// ============================================================
// VIEW: STUDENT RESPONSE
// ============================================================
const viewStudentResponse = () => {
  const { chapterId, courseId } = state.viewParams;
  const ch = DB.getChapter(courseId, chapterId);
  if (!ch) return '';
  const status = chapterStatus(ch.opensAt, ch.closesAt);
  const resp = ch.responses.find(r => r.studentId === state.user.id);
  const isOpen = status === 'open';
  const backAction = state.user.role === 'teacher' ? 'go-dashboard' : 'go-student-dashboard';

  return headerHTML(ch.title, `<button class="btn btn-ghost btn-sm" data-action="${backAction}">← Back</button>`) + `
  <div class="student-response-box">
    <div class="question-display">${ch.question}</div>
    <div class="due-date">${isOpen ? `Open until ${fmtDate(ch.closesAt)}` : `Closed ${fmtDate(ch.closesAt)}`}</div>
    ${isOpen ? `
    <form data-form="submit-response">
      <input type="hidden" name="courseId" value="${courseId}">
      <input type="hidden" name="chapterId" value="${chapterId}">
      <div class="form-group">
        <textarea name="text" class="response-textarea" placeholder="Describe what confused you in 2\u20133 sentences..." required>${resp?.text || ''}</textarea>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" type="submit">${resp ? 'Update Response' : 'Submit'}</button>
      </div>
      ${resp ? `<div class="submission-status">\u2705 Last submitted ${fmtDate(resp.updatedAt || resp.submittedAt)} \u2014 you can update until the window closes.</div>` : ''}
    </form>` : `
    <div class="chapter-card" style="margin-top:16px;">
      <div class="chapter-info">
        <h3 style="font-size:0.85rem;color:var(--text-dim);">Your Response</h3>
        <div style="margin-top:8px;line-height:1.6;">${resp?.text || '<em style="color:var(--text-muted)">(No response submitted)</em>'}</div>
        ${resp?.grade !== null ? `<div style="margin-top:12px;">Grade: <span class="grade-pill ${GRADE_COLORS[resp.grade]}">${resp.grade}</span> <span style="color:var(--text-dim);font-size:0.85rem;">${GRADE_LABELS[resp.grade]}</span></div>` : ''}
        ${resp?.grade !== null && resp?.aiRationale ? `<div style="margin-top:8px;font-size:0.85rem;color:var(--text-dim);line-height:1.5;"><strong>Feedback:</strong> ${resp.aiRationale}</div>` : ''}
      </div>
    </div>`
    }
    <div class="rubric-hint">
      <strong>💡 Aim for depth:</strong> Confusion is a higher state than ignorance.<br>
      <strong>1</strong> \u2014 Name something confusing.<br>
      <strong>2</strong> \u2014 Explain <em>what</em> confused you and <em>why</em>.<br>
      <strong>3</strong> \u2014 Identify a tension between two ideas \u2014 within the text, or between the text and something you know.
    </div>
  </div>`;
};

// ============================================================
// VIEW: JOIN COURSE
// ============================================================
const viewJoinCourse = () => {
  return headerHTML('Join a Course', `<button class="btn btn-ghost btn-sm" data-action="go-student-dashboard">← Back</button>`) + `
  <div class="dashboard" style="max-width:500px;">
    <form data-form="join-course-form">
      <div class="form-group">
        <label>Course Code</label>
        <input name="code" placeholder="e.g. OPS-3710" required>
        <div class="form-hint">Enter the code provided by your instructor.</div>
      </div>
      <button class="btn btn-primary" type="submit">Join</button>
    </form>
  </div>`;
};

// ============================================================
// EVENT HANDLING
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // Delegated click handler
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'show-tab': {
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('login-form-area').innerHTML = loginFormHTML(el.dataset.tab);
        break;
      }
      case 'load-demo': {
        const { teacher, course } = DEMO.load();
        state.user = teacher;
        state.courseId = course.id;
        toast('Demo loaded! You are logged in as Prof. Uzumeri.');
        navigate('teacher-dashboard');
        break;
      }
      case 'logout': {
        state.user = null;
        state.courseId = null;
        navigate('login');
        break;
      }
      case 'go-dashboard': {
        state.gradingIndex = 0;
        navigate(state.user?.role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard');
        break;
      }
      case 'go-student-dashboard': {
        navigate('student-dashboard');
        break;
      }
      case 'go-roster': navigate('roster'); break;
      case 'go-settings': navigate('settings'); break;
      case 'go-join': navigate('join-course'); break;
      case 'add-chapter': navigate('chapter-form', {}); break;
      case 'edit-chapter': navigate('chapter-form', { chapterId: el.dataset.chapter }); break;
      case 'grade-chapter': {
        state.gradingIndex = 0;
        navigate('grading', { chapterId: el.dataset.chapter });
        break;
      }
      case 'view-summary': navigate('summary', { chapterId: el.dataset.chapter }); break;
      case 'set-mode': {
        state.gradingMode = el.dataset.mode;
        render();
        break;
      }
      case 'grade': {
        const grade = parseInt(el.dataset.grade);
        const studentId = el.dataset.student;
        const chapterId = el.dataset.chapter;
        DB.gradeResponse(state.courseId, chapterId, studentId, grade);
        // Animate card exit
        const card = document.getElementById('grading-card');
        if (card) {
          card.classList.add('exit-left');
          setTimeout(() => {
            state.gradingIndex++;
            render();
            // Animate entry
            const newCard = document.getElementById('grading-card');
            if (newCard) {
              newCard.classList.add('enter-right');
              requestAnimationFrame(() => {
                requestAnimationFrame(() => newCard.classList.remove('enter-right'));
              });
            }
          }, 300);
        } else {
          state.gradingIndex++;
          render();
        }
        break;
      }
      case 'grade-prev': {
        if (state.gradingIndex > 0) {
          state.gradingIndex--;
          render();
        }
        break;
      }
      case 'grade-skip': {
        state.gradingIndex++;
        render();
        break;
      }
      case 'open-chapter': {
        const chId = el.dataset.chapter;
        const coId = el.dataset.course;
        const ch = DB.getChapter(coId, chId);
        const status = chapterStatus(ch.opensAt, ch.closesAt);
        if (status === 'upcoming') {
          toast('This assignment is not open yet.', 'error');
        } else {
          navigate('student-response', { chapterId: chId, courseId: coId });
        }
        break;
      }
      case 'reset-data': {
        if (confirm('This will delete all data. Are you sure?')) {
          DB.reset();
          state.user = null;
          state.courseId = null;
          navigate('login');
          toast('All data reset.');
        }
        break;
      }
    }
  });

  // Delegated form handler
  app.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    const fd = new FormData(form);
    const formName = form.dataset.form;

    switch (formName) {
      case 'teacher-login': {
        const email = fd.get('email');
        const password = fd.get('password');
        const name = fd.get('name');
        let user = DB.findUser(email, password);
        if (!user) {
          if (DB.findUserByEmail(email)) { toast('Wrong password.', 'error'); return; }
          user = DB.createUser(name, email, password, 'teacher');
          DB.createCourse('My Course', user.id);
          toast('Account created!');
        }
        state.user = user;
        navigate('teacher-dashboard');
        break;
      }
      case 'student-login': {
        const code = fd.get('code');
        const email = fd.get('email');
        const password = fd.get('password');
        const name = fd.get('name');
        const course = DB.getCourseByCode(code);
        if (!course) { toast('Course not found. Check the code.', 'error'); return; }
        let user = DB.findUser(email, password);
        if (!user) {
          if (DB.findUserByEmail(email)) { toast('Wrong password.', 'error'); return; }
          user = DB.createUser(name, email, password, 'student');
          toast('Account created!');
        }
        DB.joinCourse(course.id, user.id);
        state.user = user;
        state.courseId = course.id;
        navigate('student-dashboard');
        break;
      }
      case 'create-course': {
        DB.createCourse(fd.get('name'), state.user.id);
        toast('Course created!');
        navigate('teacher-dashboard');
        break;
      }
      case 'save-chapter': {
        const chId = fd.get('chapterId');
        const data = {
          title: fd.get('title'),
          question: fd.get('question'),
          opensAt: new Date(fd.get('opensAt')).toISOString(),
          closesAt: new Date(fd.get('closesAt')).toISOString()
        };
        if (chId) {
          DB.updateChapter(state.courseId, chId, data);
          toast('Chapter updated.');
        } else {
          DB.addChapter(state.courseId, data.title, data.question, data.opensAt, data.closesAt);
          toast('Chapter created!');
        }
        navigate('teacher-dashboard');
        break;
      }
      case 'submit-response': {
        DB.submitResponse(fd.get('courseId'), fd.get('chapterId'), state.user.id, fd.get('text'));
        toast('Response saved!');
        navigate('student-response', { courseId: fd.get('courseId'), chapterId: fd.get('chapterId') });
        break;
      }
      case 'save-settings': {
        AIGrader.setApiKey(fd.get('apiKey'));
        AIGrader.setModel(fd.get('model'));
        toast('Settings saved.');
        break;
      }
      case 'join-course-form': {
        const course = DB.getCourseByCode(fd.get('code'));
        if (!course) { toast('Course not found.', 'error'); return; }
        DB.joinCourse(course.id, state.user.id);
        state.courseId = course.id;
        toast('Joined ' + course.name + '!');
        navigate('student-dashboard');
        break;
      }
    }
  });

  // Initial render
  render();
});
