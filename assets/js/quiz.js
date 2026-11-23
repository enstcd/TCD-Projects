/* Live quiz: student join and play flow, and the instructor host screen. */
(function () {
  const D = window.TCD;
  const SHAPES = ['Star', 'Bolt', 'Leaf', 'Cube'];
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const h = (s) => esc(s);
  let timers = [];
  function clearTimers() { timers.forEach((t) => clearInterval(t)); timers.forEach((t) => clearTimeout(t)); timers = []; }
  function every(fn, ms) { const t = setInterval(fn, ms); timers.push(t); return t; }
  function later(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; }

  function confetti() {
    const c = document.createElement('div'); c.className = 'confetti';
    const cols = ['#0E7C80', '#9E1B4B', '#F2A31B', '#3A6EA5', '#2E8B57'];
    for (let i = 0; i < 90; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % 5]; p.style.animationDuration = 2 + Math.random() * 2.5 + 's'; p.style.animationDelay = Math.random() * .8 + 's'; c.appendChild(p); }
    document.body.appendChild(c); setTimeout(() => c.remove(), 5500);
  }

  // ---------------- Student ----------------
  function join(el, code) {
    clearTimers();
    const saved = store.get('tcd_student') || {};
    const st = { code: code || '', student: saved, session: null, lesson: null };

    function stepCode(err) {
      el.innerHTML = `<div class="game"><div class="gcard center">
        <div class="chip g" style="margin-bottom:10px">${icon('Gamepad')} Live Quiz</div>
        <h1>Join a quiz</h1><p class="muted">Enter the 6-digit code your instructor shows on the board.</p>
        ${err ? `<div class="err">${h(err)}</div>` : ''}
        <form id="f" style="max-width:360px;margin:0 auto">
          <input class="i" id="code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="Quiz code" value="${h(st.code)}" style="font:800 2rem var(--head);text-align:center;letter-spacing:.2em" required>
          <button class="btn lg" style="width:100%;margin-top:12px">Next ${icon('ArrowRight')}</button>
        </form></div></div>`;
      el.querySelector('#f').onsubmit = (ev) => { ev.preventDefault(); st.code = el.querySelector('#code').value.replace(/\D/g, ''); if (st.code.length !== 6) return stepCode('The code has 6 numbers.'); stepDetails(); };
      el.querySelector('#code').focus();
    }

    function stepDetails(err) {
      const s = st.student;
      el.innerHTML = `<div class="game"><div class="gcard">
        <div class="chip" style="margin-bottom:10px">Quiz code ${h(st.code)}</div>
        <h2>Who is playing?</h2><p class="muted">Type your first name, last name and class. Use the same name and class every time, so all your scores stay together.</p>
        ${err ? `<div class="err">${h(err)}</div>` : ''}
        <form id="f">
          <div class="row2"><div class="field"><label class="f" for="fn">First name</label><input class="i" id="fn" value="${h(s.firstName || '')}" required></div>
          <div class="field"><label class="f" for="ln">Last name</label><input class="i" id="ln" value="${h(s.lastName || '')}" required></div></div>
          <label class="f">Class</label><div class="row2"><div class="field"><select class="i" id="gr" required aria-label="Grade"><option value="">Grade</option>${['4', '5', '6'].map((g) => `<option value="${g}" ${s.grade == g ? 'selected' : ''}>Grade ${g}</option>`).join('')}</select></div>
          <div class="field"><input class="i" id="sec" value="${h(s.section || '')}" placeholder="Section, for example 6BA" aria-label="Section" required maxlength="6"></div></div>
          <div class="btns"><button type="button" class="btn alt" id="back">${icon('ChevronLeft')} Back</button><button class="btn lg" id="go" style="flex:1">Join quiz</button></div>
        </form></div></div>`;
      el.querySelector('#back').onclick = () => stepCode();
      el.querySelector('#f').onsubmit = async (ev) => {
        ev.preventDefault();
        const v = (id) => el.querySelector('#' + id).value.trim();
        st.student = { firstName: v('fn'), lastName: v('ln'), grade: v('gr'), section: v('sec').toUpperCase().replace(/\s+/g, '') };
        store.set('tcd_student', st.student);
        el.querySelector('#go').disabled = true; el.querySelector('#go').textContent = 'Joining...';
        try {
          const r = await API.call('join', { code: st.code, student: st.student });
          st.session = r.session; st.student = r.student; st.attemptNo = r.attemptNo;
          st.lesson = D.lessons[r.session.lessonId];
          if (!st.lesson) return stepDetails('This quiz is not available on this version of the website. Please refresh the page.');
          if (String(st.lesson.grade) !== String(st.student.grade)) { /* allowed, but noted */ }
          r.session.status === 'live' ? play() : waiting();
        } catch (e) { stepDetails(e.message); }
      };
    }

    function waiting() {
      const L = st.lesson, P = D.projects[L.project];
      el.innerHTML = `<div class="game"><div class="gcard center">
        <div class="chip m">${h(P.name)}</div>
        <h1 style="margin-top:12px">You are in, ${h(st.student.firstName)}!</h1>
        <p class="muted">${L.isAssessment ? h(L.title) + ' | One attempt only' : 'Week ' + L.week + ': ' + h(L.title)}<br>${L.quiz.length} questions${st.attemptNo > 1 ? ' | Second try (approved by your instructor)' : ''}</p>
        <div class="waiting-dots" style="margin:22px 0"><span></span><span></span><span></span></div>
        <p>Waiting for your instructor to start the quiz...</p>
        <div class="joined" id="jl" style="justify-content:center;margin-top:14px"></div></div></div>`;
      const poll = async () => {
        try {
          const b = await API.call('board', { code: st.code });
          const jl = el.querySelector('#jl'); if (jl) jl.innerHTML = b.joined.map((x) => `<span>${h(x.name)}</span>`).join('');
          if (b.status === 'live') { clearTimers(); play(); }
          if (b.status === 'closed') { clearTimers(); stepCode('This quiz has ended.'); }
        } catch (e) { /* keep waiting */ }
      };
      poll(); every(poll, 3000);
    }

    function play() {
      if (st.lesson.isAssessment) return playAssess();
      const L = st.lesson, Q = L.quiz, LIMIT = L.grade == 4 ? 25 : 20;
      let qi = 0, correct = 0, points = 0, streak = 0; const answers = []; const t0 = Date.now();
      function show() {
        const q = Q[qi]; let left = LIMIT; let done = false; const qStart = Date.now();
        el.innerHTML = `<div class="game"><div class="gcard">
          <div class="qtop"><span class="chip">Question ${qi + 1} of ${Q.length}</span><span class="scorepill">${points} pts</span>${streak >= 2 ? `<span class="streak">${icon('Bolt')} ${streak} in a row</span>` : ''}
          <div class="timer"><svg width="60" height="60"><circle cx="30" cy="30" r="26" stroke="#e6f2f2" stroke-width="6" fill="none"/><circle id="ring" cx="30" cy="30" r="26" stroke="#0E7C80" stroke-width="6" fill="none" stroke-dasharray="163.4" stroke-dashoffset="0" stroke-linecap="round"/></svg><b id="tl">${LIMIT}</b></div></div>
          <div class="qtext">${h(q.q)}</div>
          <div class="answers">${q.o.map((o, i) => `<button class="ans a${i}" data-i="${i}"><span class="shape">${icon(SHAPES[i])}</span><span>${h(o)}</span></button>`).join('')}</div>
          <div id="fb"></div></div></div>`;
        const ring = el.querySelector('#ring'), tl = el.querySelector('#tl');
        const tick = every(() => {
          left = Math.max(0, LIMIT - (Date.now() - qStart) / 1000);
          tl.textContent = Math.ceil(left); ring.setAttribute('stroke-dashoffset', String(163.4 * (1 - left / LIMIT)));
          if (left <= 5) ring.setAttribute('stroke', '#9E1B4B');
          if (left <= 0 && !done) answer(-1);
        }, 100);
        function answer(i) {
          if (done) return; done = true; clearInterval(tick);
          const ok = i === q.a; const gained = ok ? Math.round(500 + 500 * (left / LIMIT)) : 0;
          if (ok) { correct++; streak++; points += gained + (streak >= 3 ? 100 : 0); } else streak = 0;
          answers.push({ q: qi, a: i, ok });
          el.querySelectorAll('.ans').forEach((b) => { const bi = +b.dataset.i; b.disabled = true; if (bi === q.a) b.classList.add('right'); else if (bi === i) b.classList.add('wrong'); else b.classList.add('dim'); });
          el.querySelector('#fb').innerHTML = `<div class="feedback ${ok ? 'y' : 'n'}">${icon(ok ? 'Check' : 'Times')}<div><b>${ok ? 'Correct! +' + gained + (streak >= 3 ? ' +100 streak bonus' : '') : i < 0 ? "Time's up!" : 'Not quite.'}</b><br>${h(q.e)}</div></div>`;
          later(() => { qi++; qi < Q.length ? show() : finish(); }, 2600);
        }
        el.querySelectorAll('.ans').forEach((b) => (b.onclick = () => answer(+b.dataset.i)));
      }
      async function finish() {
        clearTimers();
        el.innerHTML = `<div class="game"><div class="gcard center"><h2>Saving your score...</h2><div class="waiting-dots"><span></span><span></span><span></span></div></div></div>`;
        const result = { correct, total: Q.length, points, week: L.week, timeTakenSec: Math.round((Date.now() - t0) / 1000), answers };
        let attempt = null, err = null;
        for (let k = 0; k < 3 && !attempt; k++) {
          try { attempt = (await API.call('submit', { code: st.code, student: st.student, result })).attempt; } catch (e) { err = e; if (/already|approval|twice/i.test(e.message)) break; await new Promise((r) => setTimeout(r, 1500)); }
        }
        results(attempt || Object.assign({ lessonId: L.id, projectId: L.project, grade: st.student.grade, section: st.student.section, studentId: st.student.studentId, firstName: st.student.firstName, lastName: st.student.lastName, percent: Math.round(correct * 100 / Q.length), submittedAt: new Date().toISOString(), attemptNo: st.attemptNo }, result), attempt ? null : err);
      }
      show();
    }

    // Term assessment: each student works at their own pace, each question has its own timer, no answer is shown until the end.
    function playAssess() {
      const L = st.lesson, Q = L.quiz; let qi = 0, correct = 0; const answers = []; const t0 = Date.now();
      // No timer: students read at their own pace, pick an answer, then press Next. Total time is still recorded for ranking ties.
      function show() {
        const q = Q[qi]; let pick = -1, done = false; const qStart = Date.now();
        el.innerHTML = `<div class="game"><div class="gcard">
          <div class="qtop"><span class="chip">Question ${qi + 1} of ${Q.length}</span><span class="chip m">${h(L.title)}</span></div>
          <div class="progress" style="height:6px;background:#e6f2f2;border-radius:3px;margin:4px 0 14px"><div style="height:6px;border-radius:3px;background:#0E7C80;width:${Math.round(qi * 100 / Q.length)}%"></div></div>
          <div class="qtext">${h(q.q)}</div>
          <div class="answers">${q.o.map((o, i) => `<button class="ans a${i}" data-i="${i}"><span class="shape">${icon(SHAPES[i])}</span><span>${h(o)}</span></button>`).join('')}</div>
          <div class="btns" style="justify-content:flex-end;margin-top:14px"><button class="btn gold" id="nx" disabled>${qi + 1 < Q.length ? 'Next question' : 'Finish and submit'} ${icon('ArrowRight')}</button></div></div></div>`;
        const nx = el.querySelector('#nx');
        el.querySelectorAll('.ans').forEach((b) => (b.onclick = () => { if (done) return; pick = +b.dataset.i; el.querySelectorAll('.ans').forEach((x) => x.classList.toggle('picked', x === b)); nx.disabled = false; }));
        nx.onclick = () => {
          if (done || pick < 0) return; done = true;
          const ok = pick === q.a; if (ok) correct++;
          answers.push({ q: qi, a: pick, ok: ok ? 1 : 0, s: Math.round((Date.now() - qStart) / 100) / 10 });
          qi++; qi < Q.length ? show() : finish();
        };
      }
      async function finish() {
        clearTimers();
        el.innerHTML = `<div class="game"><div class="gcard center"><h2>Saving your answers...</h2><div class="waiting-dots"><span></span><span></span><span></span></div></div></div>`;
        const secs = Math.round((Date.now() - t0) / 1000);
        const result = { correct, total: Q.length, points: correct, week: L.week, timeTakenSec: secs, answers };
        let attempt = null, err = null;
        for (let k = 0; k < 3 && !attempt; k++) {
          try { attempt = (await API.call('submit', { code: st.code, student: st.student, result })).attempt; } catch (e) { err = e; if (/already|approval|twice/i.test(e.message)) break; await new Promise((r) => setTimeout(r, 1500)); }
        }
        const a = attempt || Object.assign({ firstName: st.student.firstName, lastName: st.student.lastName, percent: Math.round(correct * 100 / Q.length) }, result);
        a.answers = answers;
        assessResults(a, attempt ? null : err);
      }
      show();
    }

    function assessResults(a, err) {
      const L = st.lesson; const B = Docs.breakdown(L, a.answers); const pct = Math.round(a.correct * 100 / a.total);
      if (pct >= 70) confetti();
      el.innerHTML = `<div class="game"><div class="gcard center">
        ${err ? `<div class="err">Your answers could not be saved: ${h(err.message)} Please show this screen to your instructor.</div>` : '<div class="ok">Your answers have been saved. Your instructor will give out the certificates.</div>'}
        <div class="chip m">${h(L.title)} | Grade ${h(L.grade)}</div>
        <h1 style="margin:12px 0 4px">Well done, ${h(a.firstName)}!</h1>
        <div class="grid g3" style="margin:20px 0">
          <div class="stat"><b>${a.correct}/${a.total}</b><span>Marks</span></div>
          <div class="stat"><b>${pct}%</b><span>${Docs.level(pct)}</span></div>
          <div class="stat"><b>${Docs.fmtTime(a.timeTakenSec)}</b><span>Time taken</span></div>
        </div>
        <div style="max-width:560px;margin:0 auto;text-align:left">${B.map((p) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:10px 4px;border-bottom:1px solid #DDE6E8"><span>${h(p.name)}</span><b>${p.percent}%</b></div>`).join('')}</div>
      </div></div>`;
    }

    function results(a, err) {
      const L = st.lesson, P = D.projects[L.project]; const pct = Math.round(a.correct * 100 / a.total);
      if (pct >= 70) confetti();
      el.innerHTML = `<div class="game"><div class="gcard center">
        ${err ? `<div class="err">Your score could not be saved: ${h(err.message)} Please show this screen to your instructor.</div>` : '<div class="ok">Your score has been saved to your class list.</div>'}
        <div class="chip m">${h(P.name)} | Week ${L.week}</div>
        <h1 style="margin:12px 0 4px">Well done, ${h(a.firstName)}!</h1>
        <div class="grid g3" style="margin:20px 0">
          <div class="stat"><b>${a.correct}/${a.total}</b><span>Marks</span></div>
          <div class="stat"><b>${pct}%</b><span>${Docs.level(pct)}</span></div>
          <div class="stat"><b>${a.points}</b><span>Game points</span></div>
        </div>
        <div id="pod"></div>
        <div class="btns" style="justify-content:center">
          <button class="btn" id="dl">${icon('Download')} Download my score report (PDF)</button>
          <a class="btn alt" href="#/me">${icon('UserGraduate')} My results</a>
        </div>
        <p class="small muted" style="margin-top:14px">Your instructor will add behaviour points to your report. Certificates are given at the end of each project once your instructor approves them.</p>
      </div></div>`;
      el.querySelector('#dl').onclick = async (ev) => { ev.target.disabled = true; ev.target.textContent = 'Preparing PDF...'; try { await Docs.scoreReport(a); } finally { ev.target.disabled = false; ev.target.innerHTML = icon('Download') + ' Download my score report (PDF)'; } };
      const pod = async () => { try { const b = await API.call('board', { code: st.code }); const pe = el.querySelector('#pod'); if (pe) pe.innerHTML = podium(b.board, a.studentId); } catch (e) { } };
      pod(); every(pod, 5000);
    }

    st.code ? stepDetails() : stepCode();
  }

  function rank(board) { return board.slice().sort((x, y) => (y.points - x.points) || ((+x.t || 0) - (+y.t || 0))); }
  function podium(board, me) {
    const s = rank(board);
    if (!s.length) return '';
    const p = (i, cls) => s[i] ? `<div class="${cls}"><b>${i + 1}</b>${esc(s[i].name)}<br><span style="opacity:.85">${s[i].t !== undefined && s[i].points === s[i].correct ? s[i].correct + '/' + s[i].total : s[i].points + ' pts'}</span></div>` : '<div></div>';
    const myRank = s.findIndex((x) => x.id === me);
    return `<div class="podium">${p(1, 'p2')}${p(0, 'p1')}${p(2, 'p3')}</div>${myRank >= 0 ? `<p><b>Your place: ${myRank + 1} of ${s.length}</b></p>` : ''}`;
  }

  // ---------------- Host ----------------
  function host(el, code, token) {
    clearTimers();
    let ses = null;
    const link = location.href.split('#')[0] + '#/join/' + code;
    async function init() {
      try { ses = (await API.call('session', { code })).session; } catch (e) { el.innerHTML = `<div class="err">${esc(e.message)}</div>`; return; }
      const L = D.lessons[ses.lessonId], P = D.projects[ses.projectId];
      el.innerHTML = `<div class="crumbs">${L.isAssessment ? `<a href="#/assessment">Term 1 Skills Assessment</a> / Grade ${esc(L.grade)}` : `<a href="#/lesson/${L.id}">${esc(P.name)}: Week ${L.week}</a> / Live quiz`}</div>
        <div class="grid" style="grid-template-columns:minmax(280px,1fr) 1.3fr;align-items:start" id="hg">
          <div class="card pad-l center">
            <div class="chip m">Grade ${esc(ses.grade)}${ses.section ? ' ' + esc(ses.section) : ''} | ${esc(L.title)}</div>
            <p class="muted" style="margin:16px 0 6px">Go to the TCD website, tap <b>Join a Quiz</b> and enter</p>
            <div class="bigcode">${code}</div>
            <div class="qr" id="qr" style="margin:18px auto 6px"></div>
            <p class="small muted">or scan to join</p>
            <div class="btns" style="justify-content:center;margin-top:12px" id="hb"></div>
          </div>
          <div class="card pad-l">
            <div class="section-title" style="margin-top:0"><h2 id="st"></h2><span class="chip" id="cnt"></span></div>
            <div class="joined" id="jl"></div>
            <div id="lbw" style="margin-top:18px"></div>
          </div>
        </div>`;
      if (window.innerWidth < 800) el.querySelector('#hg').style.gridTemplateColumns = '1fr';
      try { new QRCode(el.querySelector('#qr'), { text: link, width: 168, height: 168, colorDark: '#0A5C5F' }); } catch (e) { el.querySelector('#qr').textContent = link; }
      draw(); poll(); every(poll, 3000);
    }
    function draw() {
      const hb = el.querySelector('#hb'); if (!hb) return;
      hb.innerHTML = ses.status === 'waiting' ? `<button class="btn lg gold" id="start">${icon('Play')} Start the quiz</button>` : ses.status === 'live' ? `<button class="btn lg maroon" id="end">${icon('FlagCheckered')} End the quiz</button>` : `<a class="btn lg" href="#/results">${icon('ChartBar')} Open results</a>`;
      const s = el.querySelector('#start'), en = el.querySelector('#end');
      if (s) s.onclick = async () => { s.disabled = true; await API.call('setStatus', { token, code, status: 'live' }); ses.status = 'live'; draw(); };
      if (en) en.onclick = async () => { if (!confirm('End the quiz now? Students who have not finished will not be able to submit.')) return; await API.call('setStatus', { token, code, status: 'closed' }); ses.status = 'closed'; draw(); confetti(); };
      el.querySelector('#st').textContent = ses.status === 'waiting' ? 'Waiting for players' : ses.status === 'live' ? 'Quiz in progress' : 'Final results';
    }
    async function poll() {
      try {
        const b = await API.call('board', { code });
        if (b.status !== ses.status) { ses.status = b.status; draw(); }
        el.querySelector('#cnt').textContent = `${b.joined.length} joined | ${b.board.length} finished`;
        el.querySelector('#jl').innerHTML = b.joined.map((x) => `<span>${esc(x.name)}</span>`).join('') || '<p class="muted">No one has joined yet.</p>';
        const s = rank(b.board); const isA = ses.lessonId && /-t1a$/.test(ses.lessonId);
        el.querySelector('#lbw').innerHTML = s.length ? podium(s) + `<table class="lb">${s.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.name)}</td><td>${x.correct}/${x.total}</td><td style="text-align:right">${isA ? `<b>${Math.round(x.correct * 100 / x.total)}%</b> | ${Docs.fmtTime(x.t)}` : `<b>${x.points}</b> pts`}</td></tr>`).join('')}</table>` : '';
      } catch (e) { /* retry next tick */ }
    }
    init();
  }

  window.Quiz = { join, host, clearTimers, podium, rank };
})();
