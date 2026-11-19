/* Data layer: talks to the Google Apps Script backend, or to a local demo store when no backend is set. */
(function () {
  const URL_ = (window.TCD_CONFIG && window.TCD_CONFIG.BACKEND_URL || '').trim();
  const DEMO = !URL_;

  async function remote(action, body) {
    const res = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action }, body || {})) });
    if (!res.ok) throw new Error('The server did not respond. Please try again.');
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }

  // ---------- Demo store (same rules as the real backend, kept in localStorage) ----------
  const KEY = 'tcd_demo_db_v2';
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }
  let mem = load() || { Students: [], Sessions: [], Attempts: [], Retakes: [], Certificates: [], Rubrics: [], Settings: [], Gallery: [], Games: {}, tokens: {}, joined: {} };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* storage blocked: keep in memory */ } }
  window.addEventListener('storage', (e) => { if (e.key === KEY) { const d = load(); if (d) mem = d; } });
  const now = () => new Date().toISOString();
  const norm = (s) => String(s || '').trim().toUpperCase();
  const cap = (s) => { s = String(s || '').trim(); return s ? s[0].toUpperCase() + s.slice(1) : s; };
  const keyOf = (s) => norm([s.grade, s.section, s.firstName, s.lastName].map((x) => String(x || '').trim().replace(/\s+/g, ' ')).join('|'));
  const BEHAVIOUR = ['Excellent', 'Good', 'Satisfactory', 'Needs improvement'], COMPLETION = ['Completed', 'In progress', 'Not completed'];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const USERS = { lubna: ['Ms. Lubna Kakkengal', 'instructor', 'TCD123'], dilan: ['Mr. Dilan Devendra', 'instructor', 'TCD123'], guest: ['Guest', 'guest', '12345'] };
  function fail(m) { throw new Error(m); }
  function auth(b, inst) {
    mem = load() || mem;
    const u = mem.tokens[b.token]; if (!u) fail('Please log in again.');
    if (inst && u.role !== 'instructor') fail('This action needs an instructor login.');
    return u;
  }

  const demo = {
    login(b) {
      const u = USERS[b.user]; if (!u) fail('Unknown user.');
      if (String(b.password) !== u[2]) fail('Wrong password.');
      const token = uid() + uid(); mem.tokens[token] = { user: b.user, name: u[0], role: u[1] }; save();
      return { token, user: mem.tokens[token] };
    },
    student(b) {
      const s = b.student || {};
      if (!s.firstName || !s.lastName || !s.grade) fail('First name, last name and class are needed.');
      const id = keyOf(s);
      const rec = { studentId: id, firstName: cap(s.firstName), lastName: cap(s.lastName), grade: String(s.grade || ''), section: norm(s.section), updatedAt: now() };
      const f = mem.Students.find(x => x.studentId === id);
      if (f) Object.assign(f, rec);
      else { rec.createdAt = now(); mem.Students.push(rec); }
      save(); return { student: rec };
    },
    createSession(b) {
      const u = auth(b, true); let code;
      do { code = String(Math.floor(100000 + Math.random() * 900000)); } while (mem.Sessions.some(s => s.code === code));
      const rec = { code, lessonId: b.lessonId, projectId: b.projectId, grade: String(b.grade || ''), section: norm(b.section), createdBy: u.name, status: 'waiting', createdAt: now() };
      mem.Sessions.push(rec); mem.joined[code] = []; save(); return { session: rec };
    },
    session(b) {
      mem = load() || mem;
      const s = mem.Sessions.find(x => x.code === String(b.code).trim()); if (!s) fail('Quiz code not found. Check the code on the board.');
      return { session: s };
    },
    setStatus(b) {
      auth(b, true); const s = mem.Sessions.find(x => x.code === b.code); if (!s) fail('Session not found.');
      s.status = b.status; if (b.status === 'live') s.startedAt = now(); if (b.status === 'closed') s.closedAt = now(); save(); return {};
    },
    join(b) {
      const { session } = demo.session(b); if (session.status === 'closed') fail('This quiz has ended.');
      const { student } = demo.student(b); const prior = mem.Attempts.filter(a => a.studentId === student.studentId && a.lessonId === session.lessonId);
      if (prior.length >= 2) fail('You have already played this quiz twice.');
      if (prior.length === 1 && !mem.Retakes.find(r => r.studentId === student.studentId && r.lessonId === session.lessonId && !r.used)) fail('You have already played this quiz. Ask your instructor to approve a second try.');
      const list = mem.joined[session.code] = mem.joined[session.code] || [];
      if (!list.some(x => x.id === student.studentId)) list.push({ id: student.studentId, name: student.firstName + ' ' + student.lastName[0] + '.' });
      save(); return { session, student, attemptNo: prior.length + 1 };
    },
    submit(b) {
      const { session } = demo.session(b); const s = b.student, r = b.result; const id = keyOf(s);
      const prior = mem.Attempts.filter(a => a.studentId === id && a.lessonId === session.lessonId);
      if (prior.some(a => a.code === session.code)) fail('You have already submitted this quiz.');
      if (prior.length >= 2) fail('You have already played this quiz twice.');
      if (prior.length === 1) { const rt = mem.Retakes.find(x => x.studentId === id && x.lessonId === session.lessonId && !x.used); if (!rt) fail('A second try needs instructor approval.'); rt.used = now(); }
      const total = Math.max(1, +r.total || 1), correct = Math.min(total, Math.max(0, +r.correct || 0));
      const rec = { attemptId: uid(), code: session.code, lessonId: session.lessonId, projectId: session.projectId, grade: String(s.grade || session.grade), section: norm(s.section), week: String(r.week || ''), studentId: id, firstName: cap(s.firstName), lastName: cap(s.lastName), correct, total, percent: Math.round(correct * 100 / total), points: +r.points || 0, attemptNo: prior.length + 1, timeTakenSec: +r.timeTakenSec || 0, answers: JSON.stringify(r.answers || []), submittedAt: now(), behaviour: '', completion: '', behaviourNote: '' };
      mem.Attempts.push(rec); save(); return { attempt: rec };
    },
    board(b) {
      const { session } = demo.session(b);
      const board = mem.Attempts.filter(a => a.code === session.code).map(a => ({ id: a.studentId, name: a.firstName + ' ' + a.lastName[0] + '.', points: a.points, correct: a.correct, total: a.total, t: a.timeTakenSec }));
      return { status: session.status, joined: mem.joined[session.code] || [], board };
    },
    results(b) {
      auth(b, true); const f = b.filter || {};
      const attempts = mem.Attempts.filter(a => (!f.grade || a.grade == f.grade) && (!f.section || a.section === norm(f.section)) && (!f.projectId || a.projectId === f.projectId) && (!f.lessonId || a.lessonId === f.lessonId) && (!f.studentId || a.studentId === norm(f.studentId)));
      const settings = {}; mem.Settings.forEach((x) => (settings[x.key] = x.value)); return { attempts, students: mem.Students, retakes: mem.Retakes, certificates: mem.Certificates, rubrics: mem.Rubrics, sessions: mem.Sessions, settings };
    },
    behaviour(b) {
      const u = auth(b, true); const a = mem.Attempts.find(x => x.attemptId === b.attemptId); if (!a) fail('Result not found.');
      const k = b.behaviour || {};
      Object.assign(a, { behaviour: BEHAVIOUR.includes(k.behaviour) ? k.behaviour : '', completion: COMPLETION.includes(k.completion) ? k.completion : '', behaviourNote: String(k.note || '').slice(0, 300), behaviourBy: u.name, behaviourAt: now() });
      save(); return {};
    },
    approveRetake(b) { const u = auth(b, true); mem.Retakes.push({ studentId: norm(b.studentId), lessonId: b.lessonId, approvedBy: u.name, approvedAt: now(), used: '' }); save(); return {}; },
    approveCertificate(b) {
      const u = auth(b, true); const id = norm(b.studentId);
      let c = mem.Certificates.find(x => x.studentId === id && x.projectId === b.projectId);
      if (!c) { const st = mem.Students.find(s => s.studentId === id) || {}; c = { certId: 'TCD-' + new Date().getFullYear() + '-' + uid().slice(0, 6).toUpperCase(), studentId: id, firstName: st.firstName || '', lastName: st.lastName || '', grade: st.grade || '', section: st.section || '', projectId: b.projectId, type: b.projectId === 'TERM1' ? 'term' : 'project', approvedBy: u.name, approvedAt: now() }; mem.Certificates.push(c); save(); }
      return { certificate: c };
    },
    revokeCertificate(b) { auth(b, true); mem.Certificates = mem.Certificates.filter(c => c.certId !== b.certId); save(); return {}; },
    rubric(b) {
      const u = auth(b, true); const id = norm(b.studentId); const r = b.rubric || {};
      const rec = { studentId: id, projectId: b.projectId, term: b.term || 1, c1: r.c1 || '', c2: r.c2 || '', c3: r.c3 || '', c4: r.c4 || '', c5: r.c5 || '', comment: r.comment || '', by: u.name, updatedAt: now() };
      const i = mem.Rubrics.findIndex(x => x.studentId === id && x.projectId === b.projectId && String(x.term) === String(b.term || 1));
      if (i >= 0) mem.Rubrics[i] = rec; else mem.Rubrics.push(rec); save(); return {};
    },
    myResults(b) {
      mem = load() || mem; const s = b.student || {}; const id = keyOf(s); const st = mem.Students.find(x => x.studentId === id);
      if (!st) fail('We could not find a student with those details. Use the same name and class you used in the quiz.');
      const certificates = mem.Certificates.filter(c => c.studentId === id); const certSettings = {}; if (certificates.length) mem.Settings.forEach((x) => { if (/^(sig|certcfg|signame):/.test(x.key)) certSettings[x.key] = x.value; }); return { student: st, attempts: mem.Attempts.filter(a => a.studentId === id), certificates, certSettings };
    },
    settings() { mem = load() || mem; const o = {}; mem.Settings.forEach(s => { if (!s.key.startsWith('sig:')) o[s.key] = s.value; }); return { settings: o }; },
    gallery() { mem = load() || mem; return { items: (mem.Gallery || []).slice().reverse() }; },
    uploadMedia(b) {
      const u = auth(b, true); if (!/^(image|video)\//.test(b.mime || '')) fail('Only photos and videos can be uploaded.');
      if ((b.data || '').length > 3.5e6) fail('Demo Mode keeps files in this browser only, so please use a file under 2.5 MB here. With the real backend, files go to Google Drive.');
      const rec = { id: uid(), fileId: '', dataUrl: 'data:' + b.mime + ';base64,' + b.data, type: b.mime.startsWith('video') ? 'video' : 'image', caption: String(b.caption || '').slice(0, 140), projectId: b.projectId || '', grade: b.grade || '', by: u.name, at: now() };
      mem.Gallery = mem.Gallery || []; mem.Gallery.push(rec); save(); return { item: rec };
    },
    deleteMedia(b) { auth(b, true); mem.Gallery = (mem.Gallery || []).filter((x) => x.id !== b.id); save(); return {}; },
    gameCreate(b) {
      const u = auth(b, false); let code; mem.Games = mem.Games || {};
      do { code = String(Math.floor(10000 + Math.random() * 90000)); } while (mem.Games[code]);
      mem.Games[code] = { game: { code, gameId: b.gameId, lessonId: b.lessonId || '', status: 'waiting', by: u.name, at: now() }, players: [] }; save();
      return { game: mem.Games[code].game };
    },
    gameJoin(b) {
      mem = load() || mem; const g = (mem.Games || {})[String(b.code || '').trim()]; if (!g) fail('Game code not found. Check the code on the board.');
      if (g.game.status === 'ended') fail('This game has ended.');
      const name = String(b.name || '').trim().slice(0, 24); if (!name) fail('Please type your name.');
      const pid = uid().slice(0, 6); g.players.push({ pid, name, score: 0, done: false }); save(); return { game: g.game, pid };
    },
    gameStatus(b) { auth(b, false); mem = load() || mem; const g = (mem.Games || {})[b.code]; if (!g) fail('Game not found.'); g.game.status = b.status; save(); return { game: g.game }; },
    gameScore(b) { mem = load() || mem; const g = (mem.Games || {})[b.code]; if (!g) fail('Game not found.'); const p = g.players.find((x) => x.pid === b.pid); if (!p) fail('Player not found.'); p.score = Math.max(0, +b.score || 0); if (b.done) p.done = true; save(); return {}; },
    gameBoard(b) { mem = load() || mem; const g = (mem.Games || {})[b.code]; if (!g) fail('Game not found.'); return { game: g.game, players: g.players }; },
    setSetting(b) { const u = auth(b, true); const i = mem.Settings.findIndex(x => x.key === b.key); const rec = { key: b.key, value: b.value, updatedBy: u.name, updatedAt: now() }; if (i >= 0) mem.Settings[i] = rec; else mem.Settings.push(rec); save(); return {}; },
  };

  async function call(action, body) {
    if (!DEMO) return remote(action, body);
    await new Promise(r => setTimeout(r, 120));
    const fn = demo[action]; if (!fn) throw new Error('Unknown action');
    return Object.assign({ ok: true }, fn(body || {}));
  }

  window.API = { call, DEMO };
})();
