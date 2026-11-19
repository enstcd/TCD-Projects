/* TCD Skill Games: ten short games, played alone for practice or together in a live room
   (QR code and game code, students join with a name, scoreboard at the end, nothing is saved). */
(function () {
  const h = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- content ----------
  const TOOLS = [
    { k: 'hammer', n: 'Hammer', use: 'Drive nails into wood' },
    { k: 'saw', n: 'Hand saw', use: 'Cut wood by hand' },
    { k: 'screwdriver', n: 'Screwdriver', use: 'Turn screws in and out' },
    { k: 'wrench', n: 'Spanner', use: 'Tighten nuts and bolts' },
    { k: 'pliers', n: 'Pliers', use: 'Grip and bend wire' },
    { k: 'drill', n: 'Drill', use: 'Make round holes' },
    { k: 'clamp', n: 'Clamp', use: 'Hold work still on the bench' },
    { k: 'chisel', n: 'Chisel', use: 'Carve and shape wood' },
    { k: 'ruler', n: 'Ruler', use: 'Measure length in millimetres' },
    { k: 'glasses', n: 'Safety goggles', use: 'Protect your eyes from dust and chips' },
    { k: 'brush', n: 'Paint brush', use: 'Paint or varnish a surface' },
    { k: 'solder', n: 'Soldering iron', use: 'Join electronic parts' },
    { k: 'extinguisher', n: 'Fire extinguisher', use: 'Put out a small fire (trained adults)' },
    { k: 'machinesaw', n: 'Cool Tool saw', use: 'Cut a straight line with a machine' },
    { k: 'sander', n: 'Sanding machine', use: 'Smooth edges and round corners' },
    { k: 'laser', n: 'Laser cutter', use: 'Cut and engrave a 2D design' },
    { k: 'mask', n: 'Mask', use: 'Keep fine dust out of your lungs' },
    { k: 'marking', n: 'Pencil and square', use: 'Mark out lines before cutting' },
  ];
  const tIcon = (t) => icon('T_' + t.k);

  const SAFETY = [
    ['Wearing safety goggles near the machines', true], ['Running in the workshop', false], ['Tying long hair back before using a machine', true],
    ['Wearing gloves at the spinning sanding disc', false], ['Waiting for the teacher before starting a machine', true], ['Leaving a running machine alone', false],
    ['Wearing a mask while sanding', true], ['Putting PVC plastic in the laser cutter', false], ['Keeping bags away from the machines', true],
    ['Blowing sawdust off the table with your mouth', false], ['Wearing an apron in the workshop', true], ['Telling the teacher about a broken tool', true],
    ['Switching off and waiting until the blade stops', true], ['Two students using one machine at the same time', false], ['Wearing closed shoes in the workshop', true],
    ['Opening the laser cutter lid during a cut', false], ['Keeping fingers away from the blade line', true], ['Carrying scissors with the points up', false],
    ['Wiping up spilled glue straight away', true], ['Pouring hot wax without the teacher', false],
  ];
  const IFTHEN = [
    ['It gets dark', 'Switch the lights on'], ['The robot sees a wall', 'Stop and turn'], ['The soil is dry', 'Water the plant'],
    ['The room is too hot', 'Turn on the fan'], ['The button is pressed', 'Open the door'], ['A black line is under the sensor', 'Follow the line'],
    ['Someone comes close', 'Say hello'], ['The battery is low', 'Go to the charger'], ['The traffic light is red', 'Wait'], ['It starts to rain', 'Close the window'],
  ];
  const SHAPES = [
    { n: 'Keychain', svg: '<rect x="20" y="40" width="120" height="70" rx="14" fill="#3A6EA5"/><circle cx="42" cy="62" r="10" fill="#fff"/>', a: 'Box and a cylinder hole', o: ['Box and a cylinder hole', 'Sphere and a cone', 'Two boxes', 'Pyramid and a torus'] },
    { n: 'House', svg: '<rect x="40" y="70" width="80" height="60" fill="#C2671B"/><polygon points="30,72 80,28 130,72" fill="#9E1B4B"/>', a: 'Box and a roof', o: ['Box and a roof', 'Cylinder and a sphere', 'Torus and a box', 'Cone and a cone'] },
    { n: 'Cup', svg: '<rect x="45" y="40" width="70" height="90" rx="8" fill="#0E7C80"/><ellipse cx="80" cy="42" rx="35" ry="9" fill="#073f41"/><path d="M115 60 q30 10 0 45" stroke="#0E7C80" stroke-width="10" fill="none"/>', a: 'Cylinder, cylinder hole and a torus handle', o: ['Cylinder, cylinder hole and a torus handle', 'Box and a pyramid', 'Two spheres', 'Cone and a box'] },
    { n: 'Snowman', svg: '<circle cx="80" cy="105" r="32" fill="#9ab7b8"/><circle cx="80" cy="55" r="22" fill="#9ab7b8"/><polygon points="80,52 104,57 80,62" fill="#F2A31B"/>', a: 'Two spheres and a cone', o: ['Two spheres and a cone', 'Box and a cylinder hole', 'Torus and a pyramid', 'Three boxes'] },
    { n: 'Name tag', svg: '<rect x="15" y="50" width="130" height="50" rx="10" fill="#2E8B57"/><text x="80" y="83" font-size="22" text-anchor="middle" fill="#fff" font-family="Outfit,Arial" font-weight="700">AISHA</text>', a: 'Box and raised text', o: ['Box and raised text', 'Sphere and a torus', 'Cone and a cylinder', 'Pyramid and a hole'] },
    { n: 'Pencil holder', svg: '<rect x="45" y="30" width="70" height="100" rx="6" fill="#9E1B4B"/><rect x="58" y="30" width="44" height="90" fill="#6d1234"/>', a: 'Box with a box hole inside', o: ['Box with a box hole inside', 'Sphere and a cone', 'Two cylinders on top', 'Torus and a sphere'] },
  ];
  const PRINT = [
    ['The model sits flat on the work plane', true], ['The model is floating above the work plane', false], ['The keyring hole goes all the way through', true],
    ['A wall is only 0.3 mm thin', false], ['The model is 400 mm wide, bigger than the printer bed', false], ['The text sticks up 2 mm from the tag', true],
    ['The parts are grouped into one model', true], ['A big part hangs in the air with nothing under it', false], ['The file is exported as STL', true], ['The size is checked in millimetres', true],
  ];
  const LEVELS = [ // Code the Robot: 5x5 grid, robot r,c,dir (0 up,1 right,2 down,3 left), flag, walls
    { s: [4, 0, 0], f: [1, 0], w: [] }, { s: [4, 0, 1], f: [4, 3], w: [] }, { s: [4, 0, 0], f: [2, 2], w: [] },
    { s: [4, 1, 0], f: [0, 3], w: [[2, 1], [2, 2]] }, { s: [0, 0, 1], f: [4, 4], w: [[1, 1], [2, 3], [3, 1]] }, { s: [2, 0, 1], f: [2, 4], w: [[2, 2], [1, 2], [3, 2]] },
    { s: [4, 4, 3], f: [0, 0], w: [[3, 3], [1, 1], [2, 0], [0, 2]] }, { s: [0, 4, 2], f: [4, 0], w: [[1, 3], [2, 1], [3, 3], [3, 2]] },
  ];

  function words(L) {
    const v = (L && L.vocab && L.vocab.length ? L.vocab : ['design', 'prototype', 'safety', 'measure', 'algorithm', 'sensor', 'laser', 'sketch', 'debug', 'brand']);
    return [...new Set(v.map((x) => String(x).trim()).filter((x) => x.replace(/[^A-Za-z]/g, '').length >= 3 && x.length <= 16))];
  }

  // ---------- game list ----------
  const LIST = [
    { id: 'tool-match', n: 'Tool Match', d: 'Flip the cards and match each workshop tool picture to its name.', ic: 'T_wrench', col: '#0E7C80', secs: 75 },
    { id: 'tool-slash', n: 'Tool Slash', d: 'Tools fly up the screen. Slash only the tool that does the job.', ic: 'T_saw', col: '#9E1B4B', secs: 60 },
    { id: 'tool-jumble', n: 'Tool Name Jumble', d: 'Unscramble the letters to spell the name of the tool in the picture.', ic: 'T_hammer', col: '#C2671B', secs: 75 },
    { id: 'keyword-jumble', n: 'Keyword Jumble', d: 'Unscramble the key words from the lesson.', ic: 'Random', col: '#3A6EA5', secs: 75, lesson: true },
    { id: 'missing-letters', n: 'Missing Letters', d: 'Drag the right letters into the gaps to finish each key word.', ic: 'PuzzlePiece', col: '#6A3FA0', secs: 75, lesson: true },
    { id: '3d-design', n: '3D Design Challenge', d: 'Pick the shapes that build each object, then decide if a model is ready to print.', ic: 'Cube', col: '#3A6EA5', secs: 75 },
    { id: 'code-robot', n: 'Code the Robot', d: 'Plan the blocks that move the robot to the flag. Watch out for walls.', ic: 'T_robot', col: '#2E8B57', secs: 120 },
    { id: 'angle-spinner', n: 'Angle Spinner', d: 'Turn the pointer to the angle on the screen. The closer you are, the more points.', ic: 'Compass', col: '#D49A12', secs: 60 },
    { id: 'safety-spotter', n: 'Safety Spotter', d: 'Is it safe or not safe? Decide fast.', ic: 'HardHat', col: '#9E1B4B', secs: 60 },
    { id: 'if-then', n: 'If-Then Sort', d: 'Match each IF to the right THEN, like a robot making decisions.', ic: 'Microchip', col: '#0A5C5F', secs: 75 },
  ];
  const byId = (id) => LIST.find((g) => g.id === id);
  const GAMES_FOR = { 'shadow-candle-holder': ['safety-spotter', 'tool-match', 'tool-slash', 'tool-jumble'], 'safety-induction': ['safety-spotter', 'tool-match', 'tool-jumble'], 'candle-making': ['safety-spotter'], 'soap-making': ['safety-spotter'], 'matatalab-pro': ['code-robot', 'angle-spinner'], 'photon-eco-mission': ['code-robot', 'if-then'], 'photon-ai-mission': ['code-robot', 'if-then', 'angle-spinner'], 'junior-designer': ['3d-design'], 'junior-innovator': ['3d-design', 'tool-match'], 'junior-engineer': ['3d-design', 'tool-slash'], 'flowlab-game-studio': ['code-robot'], 'laser-metal-studio': ['tool-match', 'safety-spotter'], 'hydroponics-courtyard-farm': ['if-then', 'tool-match'] };
  function forLesson(L) { const base = GAMES_FOR[L.project] || []; return [...new Set(base.concat(['keyword-jumble', 'missing-letters']))]; }

  // ---------- shared shell: header with timer and score ----------
  function shell(stage, meta, onEnd) {
    stage.innerHTML = `<div class="gm"><div class="gm-hud"><span class="gm-name">${icon(meta.ic)} ${h(meta.n)}</span><span class="gm-score"><b id="gsc">0</b> pts</span><span class="gm-time" id="gtm">${meta.secs}s</span></div>
      <div class="gm-bar"><i id="gbar"></i></div><div class="gm-stage" id="gst"></div><div class="gm-msg" id="gmsg"></div></div>`;
    const st = { score: 0, streak: 0, left: meta.secs, over: false, timers: [] };
    const scEl = stage.querySelector('#gsc'), tmEl = stage.querySelector('#gtm'), bar = stage.querySelector('#gbar'), msg = stage.querySelector('#gmsg');
    const api = {
      el: stage.querySelector('#gst'),
      add(n, good) { if (st.over) return; if (good) { st.streak++; n += Math.min(5, st.streak - 1) * 10; } else st.streak = 0; st.score = Math.max(0, st.score + n); scEl.textContent = st.score; api.flash(good ? '+' + n : (n < 0 ? String(n) : 'Not quite'), good); api.onScore && api.onScore(st.score); },
      flash(t, good) { msg.textContent = t; msg.className = 'gm-msg show ' + (good ? 'ok' : 'no'); clearTimeout(st.ft); st.ft = setTimeout(() => (msg.className = 'gm-msg'), 700); },
      get score() { return st.score; }, get over() { return st.over; },
      later(fn, ms) { const t = setTimeout(() => { if (!st.over) fn(); }, ms); st.timers.push(t); return t; },
      end() { if (st.over) return; st.over = true; clearInterval(st.iv); st.timers.forEach(clearTimeout); onEnd(st.score); },
      destroy() { st.over = true; clearInterval(st.iv); st.timers.forEach(clearTimeout); },
    };
    st.iv = setInterval(() => { st.left--; tmEl.textContent = st.left + 's'; bar.style.width = (100 * st.left / meta.secs) + '%'; if (st.left <= 0) api.end(); }, 1000);
    bar.style.width = '100%';
    return api;
  }

  // ---------- the ten games ----------
  const RUN = {
    'tool-match'(g) {
      let round = 0;
      const deal = () => {
        const set = shuffle(TOOLS).slice(0, 6); round++;
        const cards = shuffle(set.map((t) => ({ k: t.k, pic: true, t })).concat(set.map((t) => ({ k: t.k, pic: false, t }))));
        g.el.innerHTML = `<div class="tm-grid">${cards.map((c, i) => `<button class="tm-card" data-i="${i}"><span class="back">${icon('Tools')}</span><span class="face">${c.pic ? `<span class="tpic">${tIcon(c.t)}</span>` : `<b>${h(c.t.n)}</b>`}</span></button>`).join('')}</div>`;
        let open = [], lock = false, left = 6;
        g.el.querySelectorAll('.tm-card').forEach((b) => (b.onclick = () => {
          if (lock || b.classList.contains('up') || g.over) return;
          b.classList.add('up'); open.push(b);
          if (open.length === 2) {
            const [a, c] = open.map((x) => cards[+x.dataset.i]); lock = true;
            if (a.k === c.k && a.pic !== c.pic) { open.forEach((x) => x.classList.add('done')); open = []; lock = false; g.add(100, true); if (--left === 0) g.later(deal, 600); }
            else { g.add(0, false); g.later(() => { open.forEach((x) => x.classList.remove('up')); open = []; lock = false; }, 800); }
          }
        }));
      };
      deal();
    },
    'tool-slash'(g) {
      g.el.innerHTML = `<div class="ts-prompt" id="tp"></div><div class="ts-arena" id="ta"></div>`;
      const ar = g.el.querySelector('#ta'), pr = g.el.querySelector('#tp');
      let target = null, down = false;
      const newTarget = () => { target = pick(TOOLS); pr.innerHTML = `Slash the tool used to: <b>${h(target.use)}</b>`; };
      newTarget();
      const slash = (it) => {
        if (it.dataset.cut || g.over) return; it.dataset.cut = 1; it.classList.add('cut');
        if (it.dataset.k === target.k) { g.add(100, true); newTarget(); } else g.add(-30, false);
        setTimeout(() => it.remove(), 350);
      };
      ar.onpointerdown = (e) => { down = true; const t = e.target.closest('.ts-item'); if (t) slash(t); };
      window.addEventListener('pointerup', () => (down = false));
      ar.onpointermove = (e) => { if (!down) return; const t = document.elementFromPoint(e.clientX, e.clientY); const it = t && t.closest && t.closest('.ts-item'); if (it) slash(it); };
      const spawn = () => {
        if (g.over) return;
        const t = Math.random() < 0.38 ? target : pick(TOOLS);
        const it = document.createElement('div'); it.className = 'ts-item'; it.dataset.k = t.k; it.innerHTML = tIcon(t);
        const W = ar.clientWidth, H = ar.clientHeight; const x0 = 20 + Math.random() * (W - 110); const peak = H * (0.15 + Math.random() * 0.3); const dx = (Math.random() - 0.5) * 160; const dur = 2600 + Math.random() * 900;
        it.style.left = x0 + 'px'; it.style.top = H + 'px'; ar.appendChild(it);
        const t0 = performance.now();
        const step = (now) => { if (!it.isConnected) return; const p = (now - t0) / dur; if (p >= 1) { it.remove(); return; } const y = H - (H - peak) * 4 * p * (1 - p) - 10; it.style.transform = `translate(${dx * p}px, ${y - H}px) rotate(${p * 300}deg)`; requestAnimationFrame(step); };
        requestAnimationFrame(step);
        g.later(spawn, 650 + Math.random() * 450);
      };
      spawn();
    },
    'tool-jumble'(g) { jumbleGame(g, () => { const t = pick(TOOLS); return { word: t.n.toUpperCase(), hint: `<span class="tpic big">${tIcon(t)}</span><div class="muted">${h(t.use)}</div>` }; }); },
    'keyword-jumble'(g, L) { const ws = shuffle(words(L)); let i = 0; jumbleGame(g, () => { const w = ws[i++ % ws.length]; return { word: w.toUpperCase(), hint: `<div class="muted">A key word from ${h(L ? 'Week ' + L.week + ': ' + L.title : 'TCD')}</div>` }; }); },
    'missing-letters'(g, L) {
      const ws = shuffle(words(L)); let i = 0;
      const next = () => {
        const w = ws[i++ % ws.length].toUpperCase(); const idx = []; const letters = [...w].map((c, k) => (/[A-Z]/.test(c) ? k : -1)).filter((k) => k >= 0);
        const n = Math.min(3, Math.max(1, Math.floor(letters.length / 3))); shuffle(letters).slice(0, n).forEach((k) => idx.push(k)); idx.sort((a, b) => a - b);
        const tiles = shuffle(idx.map((k) => w[k]).concat(shuffle('AEIOURSTLNMCDP'.split('').filter((c) => !w.includes(c))).slice(0, 3)));
        g.el.innerHTML = `<p class="muted center">Drag (or tap) the letters into the gaps.</p><div class="ml-word">${[...w].map((c, k) => (idx.includes(k) ? `<span class="ml-gap" data-k="${k}"></span>` : `<span class="ml-l">${c === ' ' ? '&nbsp;' : h(c)}</span>`)).join('')}</div>
          <div class="ml-tiles">${tiles.map((c, j) => `<button class="ml-tile" data-j="${j}" data-c="${c}">${c}</button>`).join('')}</div><div class="center"><button class="btn alt sm" id="skip">Skip</button></div>`;
        const gaps = [...g.el.querySelectorAll('.ml-gap')];
        const place = (tile, gap) => {
          if (!gap || gap.dataset.filled) return;
          gap.textContent = tile.dataset.c; gap.dataset.filled = tile.dataset.c; tile.disabled = true; tile.style.visibility = 'hidden';
          if (gaps.every((x) => x.dataset.filled)) {
            const ok = gaps.every((x) => x.dataset.filled === w[+x.dataset.k]);
            if (ok) { g.add(100, true); g.later(next, 500); } else { g.add(0, false); g.later(() => { gaps.forEach((x) => { x.textContent = ''; delete x.dataset.filled; }); g.el.querySelectorAll('.ml-tile').forEach((t) => { t.disabled = false; t.style.visibility = ''; }); }, 600); }
          }
        };
        g.el.querySelectorAll('.ml-tile').forEach((t) => {
          t.onpointerdown = (e) => {
            if (t.disabled) return; e.preventDefault();
            const ghost = t.cloneNode(true); ghost.className = 'ml-tile ghost'; document.body.appendChild(ghost);
            const sx = e.clientX, sy = e.clientY; let moved = false;
            const mv = (ev) => { if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 6) moved = true; ghost.style.left = ev.clientX - 22 + 'px'; ghost.style.top = ev.clientY - 22 + 'px'; };
            mv(e); ghost.style.display = 'none';
            const mvh = (ev) => { mv(ev); if (moved) ghost.style.display = ''; };
            const up = (ev) => {
              document.removeEventListener('pointermove', mvh); document.removeEventListener('pointerup', up); ghost.remove();
              if (!moved) { place(t, gaps.find((x) => !x.dataset.filled)); return; }
              const el = document.elementFromPoint(ev.clientX, ev.clientY); place(t, el && el.closest && el.closest('.ml-gap'));
            };
            document.addEventListener('pointermove', mvh); document.addEventListener('pointerup', up);
          };
        });
        g.el.querySelector('#skip').onclick = () => { g.add(0, false); next(); };
      };
      next();
    },
    '3d-design'(g) {
      let i = 0; const rounds = shuffle(SHAPES.map((s) => ({ t: 'shape', s })).concat(PRINT.map((p) => ({ t: 'print', p }))));
      const next = () => {
        const r = rounds[i++ % rounds.length];
        if (r.t === 'shape') {
          const opts = shuffle(r.s.o);
          g.el.innerHTML = `<p class="center"><b>Shape Builder:</b> which shapes build this ${h(r.s.n.toLowerCase())}?</p><div class="center"><svg viewBox="0 0 160 150" class="d3-svg">${r.s.svg}</svg></div><div class="opts">${opts.map((o) => `<button class="opt" data-o="${h(o)}">${h(o)}</button>`).join('')}</div>`;
          g.el.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { const ok = b.dataset.o === r.s.a; b.classList.add(ok ? 'right' : 'wrong'); g.add(ok ? 100 : 0, ok); g.later(next, 600); }));
        } else {
          g.el.innerHTML = `<p class="center"><b>Print Ready?</b></p><div class="pr-card">${icon('Print')}<p>${h(r.p[0])}</p></div><div class="opts two"><button class="opt" data-v="1">${icon('Check')} Ready to print</button><button class="opt" data-v="0">${icon('Tools')} Fix it first</button></div>`;
          g.el.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { const ok = (b.dataset.v === '1') === r.p[1]; b.classList.add(ok ? 'right' : 'wrong'); g.add(ok ? 80 : 0, ok); g.later(next, 600); }));
        }
      };
      next();
    },
    'code-robot'(g) {
      let lv = 0;
      const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
      const load = () => {
        const L = LEVELS[lv % LEVELS.length]; let prog = [];
        const draw = (rob) => {
          const [rr, rc, rd] = rob || L.s;
          let cells = '';
          for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
            const wall = L.w.some(([a, b]) => a === r && b === c); const flag = L.f[0] === r && L.f[1] === c; const me = rr === r && rc === c;
            cells += `<div class="cr-cell ${wall ? 'wall' : ''}">${flag ? `<span class="flag">${icon('Flag')}</span>` : ''}${me ? `<span class="bot" style="transform:rotate(${rd * 90}deg)">${icon('ArrowUp')}</span>` : ''}</div>`;
          }
          return cells;
        };
        g.el.innerHTML = `<p class="center"><b>Level ${lv + 1}.</b> Build the code, then press Run.</p><div class="cr-wrap"><div class="cr-grid" id="grid">${draw()}</div>
          <div class="cr-side"><div class="cr-prog" id="prog"><span class="muted small">Your code appears here</span></div>
          <div class="cr-blocks"><button data-b="F">${icon('ArrowUp')} Forward</button><button data-b="L">${icon('Undo')} Turn left</button><button data-b="R">${icon('RedoAlt')} Turn right</button></div>
          <div class="btns"><button class="btn alt sm" id="clr">Clear</button><button class="btn sm" id="run">${icon('Play')} Run</button></div></div></div>`;
        const pe = g.el.querySelector('#prog');
        const showProg = () => { pe.innerHTML = prog.length ? prog.map((b, i) => `<span class="cb" data-i="${i}">${icon(b === 'F' ? 'ArrowUp' : b === 'L' ? 'Undo' : 'RedoAlt')}</span>`).join('') : '<span class="muted small">Your code appears here</span>'; pe.querySelectorAll('.cb').forEach((x) => (x.onclick = () => { prog.splice(+x.dataset.i, 1); showProg(); })); };
        g.el.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => { if (prog.length < 14) { prog.push(b.dataset.b); showProg(); } }));
        g.el.querySelector('#clr').onclick = () => { prog = []; showProg(); };
        g.el.querySelector('#run').onclick = () => {
          let [r, c, d] = L.s; let k = 0; const grid = g.el.querySelector('#grid'); g.el.querySelector('#run').disabled = true;
          const tick = () => {
            if (g.over) return;
            if (r === L.f[0] && c === L.f[1]) { g.add(100 + Math.max(0, 60 - prog.length * 5), true); lv++; g.later(load, 700); return; }
            if (k >= prog.length) { g.add(0, false); g.flash('Not at the flag yet. Debug!', false); g.later(() => { grid.innerHTML = draw(); g.el.querySelector('#run').disabled = false; }, 700); return; }
            const b = prog[k++];
            if (b === 'L') d = (d + 3) % 4; else if (b === 'R') d = (d + 1) % 4;
            else { const nr = r + DIRS[d][0], nc = c + DIRS[d][1]; if (nr < 0 || nc < 0 || nr > 4 || nc > 4 || L.w.some(([a, bb]) => a === nr && bb === nc)) { g.add(0, false); g.flash('Bump! Fix your code.', false); g.later(() => { grid.innerHTML = draw(); g.el.querySelector('#run').disabled = false; }, 800); return; } r = nr; c = nc; }
            grid.innerHTML = draw([r, c, d]); g.later(tick, 380);
          };
          tick();
        };
      };
      load();
    },
    'angle-spinner'(g) {
      const targets = [90, 45, 180, 120, 60, 30, 135, 150, 72, 270, 15, 225];
      const next = () => {
        const tgt = pick(targets); let a = 0;
        g.el.innerHTML = `<p class="center">Turn the pointer to <b style="font-size:1.4em">${tgt}&deg;</b> (clockwise from the top)</p>
          <div class="as-dial" id="dial"><svg viewBox="-110 -110 220 220"><circle r="100" fill="#E6F2F2" stroke="#0E7C80" stroke-width="3"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((x) => `<line x1="0" y1="-100" x2="0" y2="-88" stroke="#0A5C5F" stroke-width="3" transform="rotate(${x})"/>`).join('')}<line id="ptr" x1="0" y1="0" x2="0" y2="-86" stroke="#9E1B4B" stroke-width="7" stroke-linecap="round"/><line x1="0" y1="0" x2="0" y2="-86" stroke="#9AA8AE" stroke-width="3" stroke-dasharray="6 5"/><circle r="9" fill="#9E1B4B"/></svg></div>
          <div class="center"><div class="as-read" id="rd">0&deg;</div><div class="btns" style="justify-content:center"><button class="btn alt sm" data-s="-15">-15</button><button class="btn alt sm" data-s="-5">-5</button><button class="btn alt sm" data-s="5">+5</button><button class="btn alt sm" data-s="15">+15</button><button class="btn gold sm" id="lock">${icon('Check')} Lock it</button></div></div>`;
        const ptr = g.el.querySelector('#ptr'), rd = g.el.querySelector('#rd'), dial = g.el.querySelector('#dial');
        const set = (v) => { a = ((Math.round(v) % 360) + 360) % 360; ptr.setAttribute('transform', `rotate(${a})`); rd.innerHTML = a + '&deg;'; };
        g.el.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => set(a + +b.dataset.s)));
        const fromEv = (e) => { const r = dial.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; set(Math.atan2(x, -y) * 180 / Math.PI); };
        dial.onpointerdown = (e) => { fromEv(e); dial.setPointerCapture(e.pointerId); dial.onpointermove = fromEv; };
        dial.onpointerup = () => (dial.onpointermove = null);
        g.el.querySelector('#lock').onclick = () => { let err = Math.abs(a - tgt); err = Math.min(err, 360 - err); const pts = Math.max(0, 100 - err * 4); g.add(pts, err <= 10); g.flash(err === 0 ? 'Perfect!' : `You were ${err}° away`, err <= 10); g.later(next, 900); };
      };
      next();
    },
    'safety-spotter'(g) {
      const list = shuffle(SAFETY); let i = 0;
      const next = () => {
        const [t, safe] = list[i++ % list.length];
        g.el.innerHTML = `<div class="ss-card">${icon('HardHat')}<p>${h(t)}</p></div><div class="opts two"><button class="opt safe" data-v="1">${icon('ThumbsUp')} Safe</button><button class="opt unsafe" data-v="0">${icon('ThumbsDown')} Not safe</button></div>`;
        g.el.querySelectorAll('.opt').forEach((b) => (b.onclick = () => { const ok = (b.dataset.v === '1') === safe; b.classList.add(ok ? 'right' : 'wrong'); g.add(ok ? 60 : 0, ok); g.later(next, 450); }));
      };
      next();
    },
    'if-then'(g) {
      const next = () => {
        const set = shuffle(IFTHEN).slice(0, 4); const thens = shuffle(set.map((x) => x[1])); let sel = null, done = 0;
        g.el.innerHTML = `<p class="center muted">Tap an IF, then tap its THEN.</p><div class="it-cols"><div>${set.map((x, i) => `<button class="it-if" data-i="${i}"><b>IF</b> ${h(x[0])}</button>`).join('')}</div><div>${thens.map((x) => `<button class="it-then" data-t="${h(x)}"><b>THEN</b> ${h(x)}</button>`).join('')}</div></div>`;
        g.el.querySelectorAll('.it-if').forEach((b) => (b.onclick = () => { if (b.disabled) return; g.el.querySelectorAll('.it-if').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = b; }));
        g.el.querySelectorAll('.it-then').forEach((b) => (b.onclick = () => {
          if (!sel || b.disabled) return; const ok = set[+sel.dataset.i][1] === b.dataset.t;
          if (ok) { sel.disabled = b.disabled = true; sel.classList.add('right'); b.classList.add('right'); sel.classList.remove('sel'); sel = null; g.add(80, true); if (++done === 4) g.later(next, 600); }
          else { b.classList.add('wrong'); g.add(0, false); setTimeout(() => b.classList.remove('wrong'), 500); }
        }));
      };
      next();
    },
  };

  function jumbleGame(g, nextWord) {
    const next = () => {
      const { word, hint } = nextWord(); let letters = [...word].map((c, i) => ({ c, i })).filter((x) => x.c !== ' ');
      let mix = shuffle(letters); if (mix.map((x) => x.c).join('') === letters.map((x) => x.c).join('') && letters.length > 1) mix = mix.reverse();
      let typed = [];
      const render = () => {
        const shown = []; let ti = 0; [...word].forEach((c) => { if (c === ' ') shown.push('<span class="jb-sp"></span>'); else { const t = typed[ti++]; shown.push(`<span class="jb-slot">${t ? h(t.c) : ''}</span>`); } });
        g.el.innerHTML = `<div class="center">${hint}</div><div class="jb-ans">${shown.join('')}</div><div class="jb-tiles">${mix.map((x, j) => `<button class="ml-tile" data-j="${j}" ${typed.includes(x) ? 'disabled style="visibility:hidden"' : ''}>${h(x.c)}</button>`).join('')}</div><div class="btns" style="justify-content:center"><button class="btn alt sm" id="undo">${icon('Undo')} Undo</button><button class="btn alt sm" id="skip">Skip</button></div>`;
        g.el.querySelectorAll('.ml-tile').forEach((b) => (b.onclick = () => { typed.push(mix[+b.dataset.j]); if (typed.length === letters.length) { const ok = typed.map((x) => x.c).join('') === letters.map((x) => x.c).join(''); g.add(ok ? 100 + letters.length * 5 : 0, ok); if (ok) { render(); g.later(next, 500); return; } typed = []; } render(); }));
        g.el.querySelector('#undo').onclick = () => { typed.pop(); render(); };
        g.el.querySelector('#skip').onclick = () => { g.add(0, false); next(); };
      };
      render();
    };
    next();
  }

  // ---------- running a game (solo or in a room) ----------
  function runGame(stage, gameId, L, opts) {
    const meta = byId(gameId); opts = opts || {};
    let inst = null;
    const finish = (score) => {
      opts.onEnd && opts.onEnd(score);
      if (!opts.room) stage.innerHTML = `<div class="gcard center"><div style="font-size:48px;color:var(--gold)">${icon('Trophy')}</div><h2>Time's up!</h2><p style="font:800 3rem var(--head);margin:6px 0;color:var(--teal)">${score} points</p><div class="btns" style="justify-content:center"><button class="btn" id="again">${icon('Redo')} Play again</button><a class="btn alt" href="#/games">More games</a></div></div>`;
      const a = stage.querySelector('#again'); if (a) a.onclick = () => runGame(stage, gameId, L, opts);
    };
    inst = shell(stage, meta, finish);
    inst.onScore = opts.onScore;
    RUN[gameId](inst, L);
    return { destroy() { inst && inst.destroy(); } };
  }

  // Host screen: QR code, players joining, live scores and the final scoreboard.
  function host(el, code, token) {
    let timer = null, game = null;
    const link = location.href.split('#')[0] + '#/play/' + code;
    const podium = (ps) => { const top = ps.slice().sort((a, b) => b.score - a.score); return `<div class="podium">${[1, 0, 2].map((i) => top[i] ? `<div class="pd p${i + 1}"><div class="nm">${h(top[i].name)}</div><div class="pts">${top[i].score}</div><div class="blk">${i + 1}</div></div>` : '').join('')}</div><ol class="board">${top.map((p, i) => `<li><span>${i + 1}. ${h(p.name)}</span><b>${p.score}</b></li>`).join('')}</ol>`; };
    const draw = (b) => {
      game = b.game; const meta = byId(game.gameId) || { n: 'Game', ic: 'Gamepad' }; const ps = b.players || [];
      if (game.status === 'waiting') {
        if (!el.querySelector('#qrbox')) {
          el.innerHTML = `<div class="game"><div class="gcard center"><div class="chip g">${icon(meta.ic)} ${h(meta.n)}</div><h1 style="margin:10px 0 0">Join the game</h1><p class="muted">Scan the QR code, or open the TCD Project Hub, tap Students, then Play a Game.</p>
            <div style="display:flex;gap:28px;justify-content:center;align-items:center;flex-wrap:wrap"><div class="qr" id="qrbox"></div><div><div class="muted small">Game code</div><div class="bigcode">${h(code)}</div></div></div>
            <h3 style="margin-top:18px">Players (<span id="np">0</span>)</h3><div class="joined" id="jl"></div>
            <div class="btns" style="justify-content:center;margin-top:16px"><button class="btn gold lg" id="go">${icon('Play')} Start the game</button></div></div></div>`;
          try { new QRCode(el.querySelector('#qrbox'), { text: link, width: 180, height: 180, colorDark: '#0A5C5F' }); } catch (e) { el.querySelector('#qrbox').textContent = link; }
          el.querySelector('#go').onclick = async () => { await API.call('gameStatus', { token, code, status: 'live' }); poll(); };
        }
        el.querySelector('#np').textContent = ps.length;
        el.querySelector('#jl').innerHTML = ps.map((p) => `<span class="chip">${h(p.name)}</span>`).join('') || '<span class="muted small">Waiting for players...</span>';
      } else if (game.status === 'live') {
        el.innerHTML = `<div class="game"><div class="gcard"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="chip g">${icon(meta.ic)} ${h(meta.n)} | code ${h(code)}</div><button class="btn maroon" id="end">${icon('FlagCheckered')} End and show scoreboard</button></div>
          <h2 style="margin-top:14px">Live scores</h2><ol class="board">${ps.slice().sort((a, b) => b.score - a.score).map((p, i) => `<li><span>${i + 1}. ${h(p.name)} ${p.done ? icon('Check') : ''}</span><b>${p.score}</b></li>`).join('') || '<li class="muted">No players yet</li>'}</ol>
          <p class="small muted">${ps.filter((p) => p.done).length} of ${ps.length} players have finished. Players finish when their timer runs out.</p></div></div>`;
        el.querySelector('#end').onclick = async () => { await API.call('gameStatus', { token, code, status: 'ended' }); poll(); };
      } else {
        el.innerHTML = `<div class="game"><div class="gcard center"><div style="font-size:44px;color:var(--gold)">${icon('Trophy')}</div><h1>Scoreboard</h1><p class="muted">${h(meta.n)} | Nothing is saved. Well played, everyone!</p>${podium(ps)}<div class="btns" style="justify-content:center"><a class="btn" href="#/games">Play another game</a></div></div></div>`;
        clearInterval(timer);
      }
    };
    const poll = async () => { try { draw(await API.call('gameBoard', { code })); } catch (e) { el.innerHTML = `<div class="err">${h(e.message)}</div>`; clearInterval(timer); } };
    poll(); timer = setInterval(poll, 2500);
    return { destroy() { clearInterval(timer); } };
  }

  // Student screen: code, name, wait, play, scoreboard.
  function play(el, code) {
    let timer = null, run = null; const me = {};
    const stepCode = (err) => {
      el.innerHTML = `<div class="game"><div class="gcard center"><div class="chip g">${icon('Gamepad')} Skill Games</div><h1>Play a game</h1><p class="muted">Type the game code on the board and your name.</p>${err ? `<div class="err">${h(err)}</div>` : ''}
        <form id="f" style="max-width:360px;margin:0 auto"><input class="i" id="code" inputmode="numeric" maxlength="5" placeholder="Game code" value="${h(code || '')}" style="font:800 2rem var(--head);text-align:center;letter-spacing:.2em" required>
        <input class="i" id="nm" maxlength="24" placeholder="Your name" style="margin-top:10px;text-align:center" required value="${h((JSON.parse(localStorage.getItem('tcd_gname') || '""')) || '')}">
        <button class="btn lg" style="width:100%;margin-top:12px">Join ${icon('ArrowRight')}</button></form></div></div>`;
      el.querySelector('#f').onsubmit = async (ev) => {
        ev.preventDefault(); const c = el.querySelector('#code').value.replace(/\D/g, ''); const n = el.querySelector('#nm').value.trim();
        try { localStorage.setItem('tcd_gname', JSON.stringify(n)); } catch (e) { }
        try { const r = await API.call('gameJoin', { code: c, name: n }); Object.assign(me, { code: c, name: n, pid: r.pid, game: r.game }); wait(); } catch (e) { stepCode(e.message); }
      };
    };
    const wait = () => {
      const meta = byId(me.game.gameId);
      el.innerHTML = `<div class="game"><div class="gcard center"><div class="chip g">${icon(meta.ic)} ${h(meta.n)}</div><h2 style="margin-top:12px">You're in, ${h(me.name)}!</h2><p class="muted">${h(meta.d)}</p><p>Waiting for your teacher to start<span class="waiting-dots"></span></p></div></div>`;
      timer = setInterval(async () => { try { const b = await API.call('gameBoard', { code: me.code }); if (b.game.status === 'live') { clearInterval(timer); start(b.game); } if (b.game.status === 'ended') { clearInterval(timer); board(b); } } catch (e) { } }, 2000);
    };
    const start = (g) => {
      const L = g.lessonId && window.TCD.lessons[g.lessonId];
      let last = 0, lastSent = 0;
      const send = (done) => API.call('gameScore', { code: me.code, pid: me.pid, score: last, done: !!done }).catch(() => { });
      el.innerHTML = '<div class="game"><div class="gcard" id="stage"></div></div>';
      run = runGame(el.querySelector('#stage'), g.gameId, L, { room: true, onScore: (s) => { last = s; if (Date.now() - lastSent > 2500) { lastSent = Date.now(); send(false); } }, onEnd: async (s) => { last = s; await send(true); el.querySelector('#stage').innerHTML = `<div class="center"><div style="font-size:44px;color:var(--gold)">${icon('Trophy')}</div><h2>Time's up!</h2><p style="font:800 2.6rem var(--head);color:var(--teal);margin:0">${s} points</p><p class="muted">Look at the board for the scoreboard<span class="waiting-dots"></span></p></div>`; timer = setInterval(async () => { try { const b = await API.call('gameBoard', { code: me.code }); if (b.game.status === 'ended') { clearInterval(timer); board(b); } } catch (e) { } }, 2500); } });
    };
    const board = (b) => {
      const top = (b.players || []).slice().sort((x, y) => y.score - x.score); const rank = top.findIndex((p) => p.pid === me.pid) + 1;
      el.innerHTML = `<div class="game"><div class="gcard center"><div style="font-size:44px;color:var(--gold)">${icon('Trophy')}</div><h1>Scoreboard</h1>${rank ? `<p>You came <b>${rank}</b> of ${top.length}.</p>` : ''}<ol class="board">${top.slice(0, 10).map((p, i) => `<li class="${p.pid === me.pid ? 'me' : ''}"><span>${i + 1}. ${h(p.name)}</span><b>${p.score}</b></li>`).join('')}</ol><a class="btn" href="#/games">Practise more games</a></div></div>`;
    };
    stepCode();
    return { destroy() { clearInterval(timer); run && run.destroy(); } };
  }

  window.Games = { LIST, byId, forLesson, runGame, host, play };
})();
