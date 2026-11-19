/**
 * TCD Dubai Project Hub: Google Sheets backend (Google Apps Script web app).
 *
 * Setup (see SETUP_GUIDE):
 *  1. Create a Google Sheet, open Extensions > Apps Script, paste this file.
 *  2. Run setup() once and allow the permissions.
 *  3. Deploy > New deployment > Web app: Execute as "Me", Who has access "Anyone".
 *  4. Copy the web app URL into config.js on the website.
 *
 * Passwords live in Project Settings > Script Properties:
 *   PASS_LUBNA, PASS_DILAN (default TCD123) and PASS_GUEST (default 12345).
 */

var SHEETS = {
  Students: ['studentId', 'firstName', 'lastName', 'grade', 'section', 'createdAt', 'updatedAt'],
  Sessions: ['code', 'lessonId', 'projectId', 'grade', 'section', 'createdBy', 'status', 'createdAt', 'startedAt', 'closedAt'],
  Attempts: ['attemptId', 'code', 'lessonId', 'projectId', 'grade', 'section', 'week', 'studentId', 'firstName', 'lastName',
             'correct', 'total', 'percent', 'points', 'attemptNo', 'timeTakenSec', 'submittedAt', 'answers',
             'behaviour', 'completion', 'behaviourNote', 'behaviourBy', 'behaviourAt'],
  Retakes: ['studentId', 'lessonId', 'approvedBy', 'approvedAt', 'used'],
  Certificates: ['certId', 'studentId', 'firstName', 'lastName', 'grade', 'section', 'projectId', 'type', 'approvedBy', 'approvedAt'],
  Rubrics: ['studentId', 'projectId', 'term', 'c1', 'c2', 'c3', 'c4', 'c5', 'comment', 'by', 'updatedAt'],
  Settings: ['key', 'value', 'updatedBy', 'updatedAt'],
  Gallery: ['id', 'fileId', 'type', 'caption', 'projectId', 'grade', 'by', 'at']
};
var GALLERY_FOLDER = 'TCD Project Hub Gallery';
var BEHAVIOUR = ['Excellent', 'Good', 'Satisfactory', 'Needs improvement'];
var COMPLETION = ['Completed', 'In progress', 'Not completed'];

var USERS = {
  lubna: { name: 'Ms. Lubna Kakkengal', role: 'instructor', prop: 'PASS_LUBNA', def: 'TCD123' },
  dilan: { name: 'Mr. Dilan Devendra', role: 'instructor', prop: 'PASS_DILAN', def: 'TCD123' },
  guest: { name: 'Guest', role: 'guest', prop: 'PASS_GUEST', def: '12345' }
};

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var head = SHEETS[name];
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#0E7C80').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), head.length).setNumberFormat('@'); // keep IDs like 001234 as text
  });
  var props = PropertiesService.getScriptProperties();
  Object.keys(USERS).forEach(function (k) {
    if (!props.getProperty(USERS[k].prop)) props.setProperty(USERS[k].prop, USERS[k].def);
  });
  var first = ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 1) ss.deleteSheet(first);
}

// ---------- HTTP ----------
function doGet(e) {
  return json({ ok: true, service: 'TCD Dubai Project Hub', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    var fn = ACTIONS[req.action];
    if (!fn) return json({ ok: false, error: 'Unknown action' });
    return json(fn(req));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- helpers ----------
function sheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }

function rows(name) {
  var sh = sheet(name);
  var values = sh.getDataRange().getValues();
  var head = values.shift();
  return values.map(function (r, i) {
    var o = { _row: i + 2 };
    head.forEach(function (h, j) { o[h] = r[j] instanceof Date ? r[j].toISOString() : r[j]; });
    return o;
  });
}

function append(name, obj) {
  var head = SHEETS[name];
  sheet(name).appendRow(head.map(function (h) { return obj[h] === undefined || obj[h] === null ? '' : String(obj[h]); }));
}

function update(name, rowNum, obj) {
  var head = SHEETS[name];
  var sh = sheet(name);
  Object.keys(obj).forEach(function (k) {
    var col = head.indexOf(k);
    if (col >= 0) sh.getRange(rowNum, col + 1).setNumberFormat('@').setValue(obj[k] === null || obj[k] === undefined ? '' : String(obj[k]));
  });
}

function now() { return new Date().toISOString(); }
function clean(s, max) { return String(s === undefined || s === null ? '' : s).replace(/[<>]/g, '').trim().slice(0, max || 60); }
function cap(s) { s = clean(s, 40); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function cache() { return CacheService.getScriptCache(); }

function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function auth(req, needInstructor) {
  var raw = req.token ? cache().get('tok_' + req.token) : null;
  if (!raw) throw new Error('Please log in again.');
  var u = JSON.parse(raw);
  if (needInstructor && u.role !== 'instructor') throw new Error('This action needs an instructor login.');
  return u;
}

function normId(s) { return clean(s, 120).toUpperCase(); }
// Students log in with first name, last name and class only. Their internal key is built from these.
function keyOf(s) {
  s = s || {};
  return normId([s.grade, s.section, s.firstName, s.lastName].map(function (x) { return clean(x, 40).replace(/\s+/g, ' '); }).join('|'));
}

// ---------- actions ----------
var ACTIONS = {
  ping: function () { return { ok: true }; },

  login: function (req) {
    var u = USERS[req.user];
    if (!u) return { ok: false, error: 'Unknown user.' };
    var pass = PropertiesService.getScriptProperties().getProperty(u.prop) || u.def;
    if (String(req.password) !== pass) return { ok: false, error: 'Wrong password.' };
    var token = Utilities.getUuid();
    var info = { user: req.user, name: u.name, role: u.role };
    cache().put('tok_' + token, JSON.stringify(info), 21600); // 6 hours
    return { ok: true, token: token, user: info };
  },

  // Students register or update their details (no email or phone).
  student: function (req) {
    var s = req.student || {};
    if (!s.firstName || !s.lastName || !s.grade) return { ok: false, error: 'First name, last name and class are needed.' };
    var id = keyOf(s);
    return withLock(function () {
      var found = rows('Students').filter(function (r) { return normId(r.studentId) === id; })[0];
      var rec = { studentId: id, firstName: cap(s.firstName), lastName: cap(s.lastName), grade: clean(s.grade, 3), section: clean(s.section, 6).toUpperCase(), updatedAt: now() };
      if (found) {
        update('Students', found._row, rec);
      } else {
        rec.createdAt = now();
        append('Students', rec);
      }
      return { ok: true, student: rec };
    });
  },

  createSession: function (req) {
    var u = auth(req, true);
    return withLock(function () {
      var existing = rows('Sessions').map(function (r) { return String(r.code); });
      var code;
      do { code = String(Math.floor(100000 + Math.random() * 900000)); } while (existing.indexOf(code) >= 0);
      var rec = { code: code, lessonId: clean(req.lessonId), projectId: clean(req.projectId), grade: clean(req.grade, 3), section: clean(req.section, 6).toUpperCase(), createdBy: u.name, status: 'waiting', createdAt: now() };
      append('Sessions', rec);
      cache().put('ses_' + code, JSON.stringify(rec), 21600);
      cache().put('joined_' + code, '[]', 21600);
      return { ok: true, session: rec };
    });
  },

  session: function (req) {
    var code = clean(req.code, 6);
    var raw = cache().get('ses_' + code);
    var rec = raw ? JSON.parse(raw) : rows('Sessions').filter(function (r) { return String(r.code) === code; })[0];
    if (!rec) return { ok: false, error: 'Quiz code not found. Check the code on the board.' };
    if (!raw) cache().put('ses_' + code, JSON.stringify(rec), 21600);
    return { ok: true, session: { code: String(rec.code), lessonId: rec.lessonId, projectId: rec.projectId, grade: rec.grade, section: rec.section, status: rec.status, createdBy: rec.createdBy } };
  },

  setStatus: function (req) {
    auth(req, true);
    var code = clean(req.code, 6);
    var status = ['waiting', 'live', 'closed'].indexOf(req.status) >= 0 ? req.status : 'live';
    return withLock(function () {
      var rec = rows('Sessions').filter(function (r) { return String(r.code) === code; })[0];
      if (!rec) return { ok: false, error: 'Session not found.' };
      var upd = { status: status };
      if (status === 'live') upd.startedAt = now();
      if (status === 'closed') upd.closedAt = now();
      update('Sessions', rec._row, upd);
      rec.status = status;
      delete rec._row;
      cache().put('ses_' + code, JSON.stringify(rec), 21600);
      return { ok: true };
    });
  },

  join: function (req) {
    var code = clean(req.code, 6);
    var ses = ACTIONS.session({ code: code });
    if (!ses.ok) return ses;
    if (ses.session.status === 'closed') return { ok: false, error: 'This quiz has ended.' };
    var st = ACTIONS.student({ student: req.student });
    if (!st.ok) return st;
    var id = st.student.studentId;
    var prior = rows('Attempts').filter(function (r) { return normId(r.studentId) === id && r.lessonId === ses.session.lessonId; });
    if (prior.length >= 2) return { ok: false, error: 'You have already played this quiz twice.' };
    if (prior.length === 1) {
      var ok = rows('Retakes').filter(function (r) { return normId(r.studentId) === id && r.lessonId === ses.session.lessonId && !r.used; })[0];
      if (!ok) return { ok: false, error: 'You have already played this quiz. Ask your instructor to approve a second try.' };
    }
    withLock(function () {
      var list = JSON.parse(cache().get('joined_' + code) || '[]');
      if (!list.some(function (x) { return x.id === id; })) list.push({ id: id, name: st.student.firstName + ' ' + st.student.lastName.charAt(0) + '.' });
      cache().put('joined_' + code, JSON.stringify(list), 21600);
    });
    return { ok: true, session: ses.session, student: st.student, attemptNo: prior.length + 1 };
  },

  submit: function (req) {
    var code = clean(req.code, 6);
    var ses = ACTIONS.session({ code: code });
    if (!ses.ok) return ses;
    var s = req.student || {};
    var id = keyOf(s);
    var r = req.result || {};
    return withLock(function () {
      var prior = rows('Attempts').filter(function (a) { return normId(a.studentId) === id && a.lessonId === ses.session.lessonId; });
      if (prior.some(function (a) { return String(a.code) === code; })) return { ok: false, error: 'You have already submitted this quiz.' };
      if (prior.length >= 2) return { ok: false, error: 'You have already played this quiz twice.' };
      if (prior.length === 1) {
        var rt = rows('Retakes').filter(function (x) { return normId(x.studentId) === id && x.lessonId === ses.session.lessonId && !x.used; })[0];
        if (!rt) return { ok: false, error: 'A second try needs instructor approval.' };
        update('Retakes', rt._row, { used: now() });
      }
      var total = Math.max(1, Number(r.total) || 1);
      var correct = Math.min(total, Math.max(0, Number(r.correct) || 0));
      var rec = {
        attemptId: Utilities.getUuid().slice(0, 8), code: code, lessonId: ses.session.lessonId, projectId: ses.session.projectId,
        grade: clean(s.grade, 3) || ses.session.grade, section: clean(s.section, 6).toUpperCase(), week: clean(r.week, 3),
        studentId: id, firstName: cap(s.firstName), lastName: cap(s.lastName), correct: correct, total: total,
        percent: Math.round(correct * 100 / total), points: Math.max(0, Math.min(100000, Number(r.points) || 0)), attemptNo: prior.length + 1,
        timeTakenSec: Number(r.timeTakenSec) || 0, submittedAt: now(), answers: JSON.stringify(r.answers || []).slice(0, 2000)
      };
      append('Attempts', rec);
      var lb = JSON.parse(cache().get('lb_' + code) || '[]');
      lb.push({ id: id, name: rec.firstName + ' ' + rec.lastName.charAt(0) + '.', points: rec.points, correct: correct, total: total, t: rec.timeTakenSec });
      cache().put('lb_' + code, JSON.stringify(lb), 21600);
      return { ok: true, attempt: rec };
    });
  },

  // Live screen for the host (also readable by students for the podium).
  board: function (req) {
    var code = clean(req.code, 6);
    var ses = ACTIONS.session({ code: code });
    if (!ses.ok) return ses;
    return { ok: true, status: ses.session.status, joined: JSON.parse(cache().get('joined_' + code) || '[]'), board: JSON.parse(cache().get('lb_' + code) || '[]') };
  },

  // Instructor data views
  results: function (req) {
    auth(req, true);
    var f = req.filter || {};
    var list = rows('Attempts').filter(function (a) {
      return (!f.grade || String(a.grade) === String(f.grade)) && (!f.section || String(a.section) === String(f.section).toUpperCase()) &&
             (!f.projectId || a.projectId === f.projectId) && (!f.lessonId || a.lessonId === f.lessonId) && (!f.studentId || normId(a.studentId) === normId(f.studentId));
    });
    list.forEach(function (a) { delete a._row; if (!/-t1a$/.test(String(a.lessonId))) delete a.answers; });
    var settings = {}; rows('Settings').forEach(function (r) { settings[r.key] = r.value; });
    return { ok: true, attempts: list, students: rows('Students').map(strip), retakes: rows('Retakes').map(strip), certificates: rows('Certificates').map(strip), rubrics: rows('Rubrics').map(strip), sessions: rows('Sessions').map(strip), settings: settings };
  },

  behaviour: function (req) {
    var u = auth(req, true);
    return withLock(function () {
      var a = rows('Attempts').filter(function (x) { return x.attemptId === req.attemptId; })[0];
      if (!a) return { ok: false, error: 'Result not found.' };
      var b = req.behaviour || {};
      update('Attempts', a._row, { behaviour: BEHAVIOUR.indexOf(b.behaviour) >= 0 ? b.behaviour : '', completion: COMPLETION.indexOf(b.completion) >= 0 ? b.completion : '', behaviourNote: clean(b.note, 300), behaviourBy: u.name, behaviourAt: now() });
      return { ok: true };
    });
  },

  approveRetake: function (req) {
    var u = auth(req, true);
    append('Retakes', { studentId: normId(req.studentId), lessonId: clean(req.lessonId), approvedBy: u.name, approvedAt: now(), used: '' });
    return { ok: true };
  },

  approveCertificate: function (req) {
    var u = auth(req, true);
    return withLock(function () {
      var id = normId(req.studentId);
      var exists = rows('Certificates').filter(function (c) { return normId(c.studentId) === id && c.projectId === req.projectId; })[0];
      if (exists) return { ok: true, certificate: strip(exists) };
      var st = rows('Students').filter(function (s) { return normId(s.studentId) === id; })[0] || {};
      var rec = { certId: 'TCD-' + new Date().getFullYear() + '-' + Utilities.getUuid().slice(0, 6).toUpperCase(), studentId: id, firstName: st.firstName || '', lastName: st.lastName || '', grade: st.grade || '', section: st.section || '', projectId: clean(req.projectId), type: req.projectId === 'TERM1' ? 'term' : 'project', approvedBy: u.name, approvedAt: now() };
      append('Certificates', rec);
      return { ok: true, certificate: rec };
    });
  },

  revokeCertificate: function (req) {
    auth(req, true);
    return withLock(function () {
      var c = rows('Certificates').filter(function (x) { return x.certId === req.certId; })[0];
      if (c) sheet('Certificates').deleteRow(c._row);
      return { ok: true };
    });
  },

  rubric: function (req) {
    var u = auth(req, true);
    return withLock(function () {
      var id = normId(req.studentId);
      var r = req.rubric || {};
      var found = rows('Rubrics').filter(function (x) { return normId(x.studentId) === id && x.projectId === req.projectId && String(x.term) === String(req.term || 1); })[0];
      var rec = { studentId: id, projectId: clean(req.projectId), term: req.term || 1, c1: clean(r.c1, 12), c2: clean(r.c2, 12), c3: clean(r.c3, 12), c4: clean(r.c4, 12), c5: clean(r.c5, 12), comment: clean(r.comment, 500), by: u.name, updatedAt: now() };
      if (found) update('Rubrics', found._row, rec); else append('Rubrics', rec);
      return { ok: true };
    });
  },

  // A student checks their own results with first name, last name and class.
  myResults: function (req) {
    var s = req.student || {};
    var id = keyOf(s);
    var st = rows('Students').filter(function (x) { return normId(x.studentId) === id; })[0];
    if (!st) return { ok: false, error: 'We could not find a student with those details. Use the same name and class you used in the quiz.' };
    var attempts = rows('Attempts').filter(function (a) { return normId(a.studentId) === id; }).map(function (a) { delete a._row; if (!/-t1a$/.test(String(a.lessonId))) delete a.answers; return a; });
    var certs = rows('Certificates').filter(function (c) { return normId(c.studentId) === id; }).map(strip);
    var certSettings = {};
    if (certs.length) rows('Settings').forEach(function (r) { var k = String(r.key); if (k.indexOf('sig:') === 0 || k.indexOf('certcfg:') === 0 || k.indexOf('signame:') === 0) certSettings[k] = r.value; });
    return { ok: true, student: strip(st), attempts: attempts, certificates: certs, certSettings: certSettings };
  },

  // Public settings. Signature images (keys starting with sig:) are never sent here.
  settings: function () {
    var out = {};
    rows('Settings').forEach(function (r) { if (String(r.key).indexOf('sig:') !== 0) out[r.key] = r.value; });
    return { ok: true, settings: out };
  },

  // ---------- Skill games: live rooms kept in the cache only (nothing is saved) ----------
  gameCreate: function (req) {
    var u = auth(req, false);
    var code, tries = 0;
    do { code = String(Math.floor(10000 + Math.random() * 90000)); tries++; } while (cache().get('gm_' + code) && tries < 20);
    var rec = { code: code, gameId: clean(req.gameId, 40), lessonId: clean(req.lessonId, 20), status: 'waiting', by: u.name, at: now() };
    cache().put('gm_' + code, JSON.stringify(rec), 10800);
    cache().put('gp_' + code, '[]', 10800);
    return { ok: true, game: rec };
  },

  gameJoin: function (req) {
    var code = clean(req.code, 6);
    var raw = cache().get('gm_' + code);
    if (!raw) return { ok: false, error: 'Game code not found. Check the code on the board.' };
    var g = JSON.parse(raw);
    if (g.status === 'ended') return { ok: false, error: 'This game has ended.' };
    var name = clean(req.name, 24);
    if (!name) return { ok: false, error: 'Please type your name.' };
    return withLock(function () {
      var list = JSON.parse(cache().get('gp_' + code) || '[]');
      var pid = Utilities.getUuid().slice(0, 6);
      list.push({ pid: pid, name: name, score: 0, done: false });
      cache().put('gp_' + code, JSON.stringify(list), 10800);
      return { ok: true, game: g, pid: pid };
    });
  },

  gameStatus: function (req) {
    auth(req, false);
    var code = clean(req.code, 6);
    var raw = cache().get('gm_' + code);
    if (!raw) return { ok: false, error: 'Game not found.' };
    var g = JSON.parse(raw);
    g.status = ['waiting', 'live', 'ended'].indexOf(req.status) >= 0 ? req.status : g.status;
    if (g.status === 'live') g.startedAt = now();
    cache().put('gm_' + code, JSON.stringify(g), 10800);
    return { ok: true, game: g };
  },

  gameScore: function (req) {
    var code = clean(req.code, 6);
    return withLock(function () {
      var list = JSON.parse(cache().get('gp_' + code) || '[]');
      var p = list.filter(function (x) { return x.pid === req.pid; })[0];
      if (!p) return { ok: false, error: 'Player not found.' };
      p.score = Math.max(0, Math.min(1000000, Number(req.score) || 0));
      if (req.done) p.done = true;
      cache().put('gp_' + code, JSON.stringify(list), 10800);
      return { ok: true };
    });
  },

  gameBoard: function (req) {
    var code = clean(req.code, 6);
    var raw = cache().get('gm_' + code);
    if (!raw) return { ok: false, error: 'Game not found.' };
    return { ok: true, game: JSON.parse(raw), players: JSON.parse(cache().get('gp_' + code) || '[]') };
  },

  // ---------- Student Projects Gallery (files are stored in Google Drive) ----------
  gallery: function () {
    var list = rows('Gallery').map(strip).reverse();
    return { ok: true, items: list };
  },

  uploadMedia: function (req) {
    var u = auth(req, true);
    var data = String(req.data || '');
    var mime = clean(req.mime, 60);
    if (!/^(image|video)\//.test(mime)) return { ok: false, error: 'Only photos and videos can be uploaded.' };
    var bytes = Utilities.base64Decode(data);
    if (bytes.length > 45 * 1024 * 1024) return { ok: false, error: 'This file is too big. Please keep videos under 45 MB.' };
    var folders = DriveApp.getFoldersByName(GALLERY_FOLDER);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(GALLERY_FOLDER);
    var file = folder.createFile(Utilities.newBlob(bytes, mime, clean(req.name, 80) || 'upload'));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var rec = { id: Utilities.getUuid().slice(0, 8), fileId: file.getId(), type: mime.indexOf('video') === 0 ? 'video' : 'image', caption: clean(req.caption, 140), projectId: clean(req.projectId, 40), grade: clean(req.grade, 3), by: u.name, at: now() };
    append('Gallery', rec);
    return { ok: true, item: rec };
  },

  deleteMedia: function (req) {
    auth(req, true);
    return withLock(function () {
      var it = rows('Gallery').filter(function (x) { return x.id === req.id; })[0];
      if (!it) return { ok: true };
      try { DriveApp.getFileById(it.fileId).setTrashed(true); } catch (e) {}
      sheet('Gallery').deleteRow(it._row);
      return { ok: true };
    });
  },

  setSetting: function (req) {
    var u = auth(req, true);
    return withLock(function () {
      var key = clean(req.key, 80);
      var isSig = key.indexOf('sig:') === 0;
      var val = isSig ? String(req.value || '').slice(0, 45000) : clean(req.value, /^(yearproj|plan|pool):/.test(key) ? 20000 : 2000);
      if (isSig && val && !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(val)) return { ok: false, error: 'Please upload the signature as a PNG or JPG picture.' };
      var found = rows('Settings').filter(function (x) { return x.key === key; })[0];
      var rec = { key: key, value: val, updatedBy: u.name, updatedAt: now() };
      if (found) update('Settings', found._row, rec); else append('Settings', rec);
      return { ok: true };
    });
  }
};

function strip(o) { delete o._row; return o; }
