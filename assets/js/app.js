/* TCD Project Hub: routing and views. */
(function () {
  const D = window.TCD;
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const h = (s) => esc(s);
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
  const PCOL = { 'safety-induction': '#6B7A84', 'junior-innovator': '#3A6EA5', 'junior-engineer': '#3A6EA5', 'junior-designer': '#3A6EA5', 'candle-making': '#C2671B', 'matatalab-pro': '#2E8B57', 'photon-eco-mission': '#2E8B57', 'photon-ai-mission': '#2E8B57', 'shadow-candle-holder': '#9E1B4B', 'flowlab-game-studio': '#3A6EA5', 'hydroponics-courtyard-farm': '#2E8B57', 'term1-showcase': '#D49A12', 'soap-making': '#C2671B', 'laser-metal-studio': '#9E1B4B' };
  const PICON = { 'candle-making': 'Fire', 'matatalab-pro': 'Robot', 'term1-showcase': 'Award', 'junior-designer': 'Cube', 'maker-mark': 'Stamp', 'photon-ai-mission': 'Microchip', 'photon-eco-mission': 'Leaf', 'junior-engineer': 'Cogs', 'junior-innovator': 'Lightbulb', 'safety-induction': 'HardHat', 'soap-making': 'Water', 'laser-metal-studio': 'Cut', 'classroom-helper': 'HandsHelping', 'simple-machine-playground': 'Cogs', 'mini-garden-eco-robot': 'Seedling', 'solar-mini-device': 'SolarPanel', 'gear-machine': 'Cogs', 'eco-robot-campaign': 'Leaf', 'robotics-first-coding': 'Robot', 'design-for-real-user': 'PencilRuler', 'smart-school-garden': 'Seedling', 'safety-passport-mini-maker': 'ShieldAlt', 'robot-mission-welcome': 'Robot', 'smart-city-crossing': 'City', 'load-bearing-bridge': 'Tools', 'upcycled-textile': 'Tshirt', 'mechanical-mobility': 'CarSide', 'media-production-studio': 'Film', 'sustainable-enterprise': 'Store', 'pathway-engineering': 'Cogs', 'pathway-creative': 'Palette', 'pathway-capstone': 'Award', 'future-dubai-smart-city': 'City' };
  const pcol = (id) => PCOL[id] || '#0E7C80';
  let auth = store.get('tcd_auth');
  if (auth && Date.now() - auth.at > 6 * 3600e3) { auth = null; store.del('tcd_auth'); }
  let current = null; // active component with destroy()

  if (API.DEMO) document.getElementById('demo').classList.remove('hidden');
  document.getElementById('menuBtn').onclick = () => nav.classList.toggle('open');

  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }
  const isInst = () => auth && auth.user.role === 'instructor';
  const isStaff = () => !!auth;

  // ---------- dates ----------
  const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  function weekRange(w) { const m = /(\d+) (\w+) to (\d+) (\w+)/.exec(D.weeks[w]); if (!m) return null; const y = 2026; return [new Date(y, MON[m[2]], +m[1]), new Date(y, MON[m[4]], +m[3], 23, 59)]; }
  function currentWeek() { const n = new Date(); for (const w of Object.keys(D.weeks)) { const r = weekRange(w); if (r && n >= new Date(r[0].getTime() - 2 * 864e5) && n <= r[1]) return +w; } return null; }
  function nextTeachingWeek() { const n = new Date(); for (const w of Object.keys(D.weeks).map(Number).sort((a, b) => a - b)) { const r = weekRange(w); if (r && r[1] >= n && w !== 7 && w !== 15) return w; } return 14; }

  // ---------- nav ----------
  function drawNav(route) {
    const on = (k) => (route === k ? 'on' : '');
    const hubItems = [['#/grade/4', 'Grade 4', 'Term plan, lessons and quizzes', 'LayerGroup'], ['#/grade/5', 'Grade 5', 'Term plan, lessons and quizzes', 'LayerGroup'], ['#/grade/6', 'Grade 6', 'Term plan, lessons and quizzes', 'LayerGroup'], ['#/calendar', 'Academic Calendar', 'Terms, weeks, breaks and assessment dates', 'CalendarAlt'], ['#/framework', 'TCD Framework', 'Learning model, safety, assessment and grade plans', 'BookOpen'], ['#/assessment', 'Term 1 Skills Assessment', 'Mock test, live assessment and certificates', 'Award'], ['#/pool', 'Projects List', 'Every TCD project, with tools, plans and videos', 'Tools'], ['#/games', 'Skills Games', 'Tool Slash, Code the Robot and more', 'Gamepad']];
    if (isInst()) hubItems.push(['#/results', 'Results and Reports', 'Class lists, certificates and report cards', 'ChartBar']);
    const stuItems = [['#/join', 'Join a Quiz', 'Enter the code on the board', 'Bolt'], ['#/play', 'Play a Game', 'Join a skills game with a code', 'Gamepad'], ['#/calendar', 'Academic Calendar', 'Term dates, breaks and assessments', 'CalendarAlt'], ['#/games', 'Skills Games', 'Practise games on your own, no login needed', 'PuzzlePiece'], ['#/me', 'My Results', 'Scores, reports and certificates', 'UserGraduate']];
    const dd = (label, key, items) => `<div class="dd ${on(key)}"><button class="ddb" aria-haspopup="true">${label} ${icon('ChevronDown')}</button><div class="menu">${items.map(([href, n, d, ic]) => `<a href="${href}"><span class="mi">${icon(ic)}</span><span><b>${n}</b><small>${d}</small></span></a>`).join('')}</div></div>`;
    let s = `<a href="#/" class="${on('home')}">Home</a><a href="#/about" class="${on('about')}">About TCC</a>` + dd('TCD Project Hub', 'hub', hubItems) +
      `<a href="#/instructors" class="${on('inst')}">TCD Instructors</a><a href="#/gallery" class="${on('gallery')}">Student Projects Gallery</a><a href="#/initiatives" class="${on('ini')}">Initiatives</a>` + dd('Students', 'stu', stuItems);
    s += isStaff() ? `<span class="userchip">${icon(isInst() ? 'UserTie' : 'Eye')} ${h(auth.user.name)}</span><button class="btn sm alt" id="logout">${icon('SignOutAlt')} Log out</button>` : `<a href="#/login" class="btn sm navlogin">${icon('SignInAlt')} Login</a>`;
    nav.innerHTML = s; nav.classList.remove('open');
    nav.querySelectorAll('.dd').forEach((d) => { const b = d.querySelector('.ddb'); b.onclick = (e) => { e.stopPropagation(); const o = d.classList.contains('open'); nav.querySelectorAll('.dd').forEach((x) => x.classList.remove('open')); d.classList.toggle('open', !o); }; });
    document.body.classList.toggle('staff', isStaff());
    const lo = document.getElementById('logout'); if (lo) lo.onclick = () => { auth = null; store.del('tcd_auth'); location.hash = '#/'; };
  }
  document.addEventListener('click', () => nav.querySelectorAll('.dd.open').forEach((x) => x.classList.remove('open')));

  // ---------- router ----------
  function route() {
    if (current && current.destroy) current.destroy(); current = null;
    Quiz.clearTimers();
    document.querySelectorAll('.modal').forEach((m) => m.remove());
    const parts = (location.hash.replace(/^#\/?/, '').split('?')[0] || '').split('/');
    const [p0, p1, p2] = parts;
    const needStaff = ['grade', 'lesson', 'week', 'project', 'pool', 'results', 'host', 'ghost', 'assessment', 'mock', 'framework', 'plan'];
    if (needStaff.includes(p0) && !isStaff()) { location.hash = '#/login'; return; }
    if ((p0 === 'results' || p0 === 'host') && !isInst()) { app.innerHTML = `<div class="err">This page is for instructors only.</div>`; drawNav(''); return; }
    window.scrollTo(0, 0);
    app.classList.toggle('full', p0 === '');
    const map = {
      '': landing, about: about, gallery: gallery, initiatives: initiatives, games: () => games(p1), play: () => { drawNav('stu'); current = Games.play(app, p1); }, ghost: () => { drawNav('hub'); current = Games.host(app, p1, auth.token); }, login: login, grade: () => grade(p1), lesson: () => lesson(p1, parts[2]), week: () => week(p1, parts[2]),
      project: () => project(p1), pool: pool, calendar: calendar, framework: framework, plan: () => planPage(p1, p2), assessment: assessment, mock: () => mock(p1), instructors: instructors, join: () => { drawNav('stu'); Quiz.join(app, p1); }, me: me, results: results, host: () => { drawNav(''); Quiz.host(app, p1, auth.token); },
    };
    (map[p0] || (() => { app.innerHTML = '<h1>Page not found</h1><p><a href="#/">Go home</a></p>'; }))();
  }
  window.addEventListener('hashchange', route);

  // ---------- home (everyone) ----------
  const VISION = 'Preparing future leaders through innovation in education and treasuring of cultural heritage.';
  const MISSION = 'Emirates National Schools will provide students with educational programs that develop character, use technology to improve learning, and prepare students to be leaders and community members.';
  const AREAS = [['Design Thinking and Presentation', 'Ideas, sketches, prototypes and pitching', 'Sk_Design', '#5f6b73'], ['Safety Culture and Sustainability', 'Safe habits and responsible design', 'Sk_Safety', '#9e1b4b'], ['Robotics and Coding', 'Photon, Matatalab, Flowlab and more', 'Sk_Robot', '#2e8b57'], ['3D Design and 3D Printing', 'Tinkercad to the 3D printer', 'Sk_3D', '#3a6ea5'], ['Laser Cutting and Engraving', '2D design, precise cutting and engraving', 'Sk_Laser', '#9e1b4b'], ['Woodwork and Cool Tools', 'Unimat machines and hand tools', 'Sk_Wood', '#c2671b'], ['Logo Design and Branding', 'Canva design and badge making', 'Sk_Logo', '#0e7c80'], ['Jewellery Design', 'Pendants, keychains and wearable designs', 'Sk_Jewel', '#d49a12'], ['Candle and Soap Making', 'Materials science and heritage', 'Sk_Candle', '#c2671b'], ['Pottery and Ceramics', 'Clay design, form and finishing', 'Sk_Pottery', '#8a5a3c'], ['Hydroponics and Smart Farming', 'Growing without soil and food security', 'Sk_Hydro', '#2e8b57'], ['Engineering, Electronics and Circuits', 'Machines, circuits, sensors and power', 'Sk_Circuit', '#3a6ea5']];
  const areasGrid = () => `<div class="ag">${AREAS.map((x) => `<div class="ar"><div class="ai" style="background:${x[3]}">${icon(x[2])}</div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>`;
  const vmCards = () => `<div class="vm"><div class="vmc vision"><div class="vi">${icon('Bullseye')}</div><div><h3>Our Vision</h3><p>${VISION}</p></div></div><div class="vmc mission"><div class="vi">${icon('Seedling')}</div><div><h3>Our Mission</h3><p>${MISSION}</p></div></div></div>`;
  function weekGlance() {
    const cw = currentWeek(); const nw = nextTeachingWeek();
    const wk = cw && cw !== 7 && cw !== 15 ? cw : nw;
    const cards = ['4', '5', '6'].map((g) => {
      const e = D.grades[g].plan.find((x) => x.week === wk) || {};
      const P = D.projects[e.project] || {};
      const href = e.lessonId ? `#/lesson/${e.lessonId}` : `#/week/${g}/${wk}`;
      return `<a class="card" href="${href}"><div style="display:flex;justify-content:space-between;align-items:center"><span class="chip">Grade ${g}</span><span class="chip grey">${h(D.grades[g].session)}</span></div>
        <h3 style="margin-top:12px">${h(e.title || '')}</h3><p class="small" style="color:${pcol(e.project)};font-weight:600;margin-bottom:6px">${icon(PICON[e.project] || 'Tools')} ${h(P.name || '')}</p><p class="muted small" style="margin:0">${h(e.text || '')}</p></a>`;
    }).join('');
    return `<section class="hsec"><div class="st"><div><div class="kick">Welcome, ${h(auth.user.name)}</div><h2>Week ${wk} at a glance</h2><p class="muted" style="margin:6px 0 0">${h(D.weeks[wk])}. ${h(D.notes[wk] || '')}</p></div>${isInst() ? `<a class="btn sm" href="#/results">${icon('ChartBar')} Results and Reports</a>` : ''}</div><div class="grid g3">${cards}</div></section>`;
  }
  function galleryTiles(n) {
    const items = D.gallery.slice(0, n);
    return `<div class="gal">${items.map((g, i) => `<a class="gi ${i === 0 ? 'big' : ''}" href="#/gallery"><img src="${g.thumb || g.src}" alt="${h(g.title)}" loading="lazy" style="object-position:${g.pos || 'center'}">${g.type === 'video' ? `<span class="play">${icon('Play')}</span>` : ''}<span class="cap"><b>${h(g.title)}</b><span>${h(g.sub)}</span></span></a>`).join('')}</div>`;
  }
  function landing() {
    drawNav('home');
    const hubCards = ['4', '5', '6'].map((g) => { const G = D.grades[g]; const projs = []; G.plan.forEach((w) => { if (w.project && !['safety-induction', 'term1-showcase'].includes(w.project) && !projs.includes(w.project)) projs.push(w.project); }); return `<a class="hc" href="${isStaff() ? '#/grade/' + g : '#/login'}"><div class="g">G${g}</div><b>${h(G.course.replace(/^Future Skills \d: /, ''))}</b><p>${h(G.summary.replace(/^The term opens with a safety induction, then runs /, 'This term: ').replace(/, closing with a Term 1 showcase\.$/, '.'))}</p><div class="pills">${projs.map((p) => `<span>${h(D.projects[p].name)}</span>`).join('')}</div></a>`; }).join('');
    app.innerHTML = `
      <div class="hero2"><div class="bg"></div><div class="shade"></div><div class="wrap">
        <div class="eyebrow">Emirates National Schools | Technology and Career Center Dubai</div>
        <h1>Preparing future leaders</h1>
        <p>Hands-on design, making and coding where students turn ideas into real products, guided by the TCD Applied Design, Skills and Technologies Framework.</p>
        <div class="btns"><a class="btn gold lg" href="${isStaff() ? '#/grade/' + (['4', '5', '6'][0]) : '#/login'}">Explore the Project Hub ${icon('ArrowRight')}</a><a class="btn ghost lg" href="#/gallery">See student projects</a></div></div></div>
      <div class="wrap">
      ${isStaff() ? weekGlance() : ''}
      <section class="hsec"><div class="about"><div><div class="kick">About TCC</div><h2 class="h2big">Where ideas become real</h2>
        <p class="justify">The Technology and Career Center gives students hands-on experience that matters for their future careers and everyday life. In a safe, well-equipped workshop, they design, build, test and present, using 3D printers, laser cutters, robots and real workshop tools.</p><a class="btn alt" href="#/about">More about TCC ${icon('ArrowRight')}</a></div>${vmCards()}</div></section></div>
      <section class="hsec areas"><div class="wrap"><div class="st"><div><div class="kick">What students do</div><h2>Our skill areas</h2></div></div>${areasGrid()}</div></section>
      <div class="wrap"><section class="hsec"><div class="st"><div><div class="kick">Student Projects Gallery</div><h2>Made by our students</h2></div><a class="btn sm" href="#/gallery">View full gallery</a></div>${galleryTiles(5)}</section>${iniTeaser()}</div>
      <section class="hsec hub"><div class="wrap"><div class="st"><div><div class="kick">TCD Project Hub</div><h2>Term 1 at a glance</h2></div><a class="btn white sm" href="${isStaff() ? '#/grade/4' : '#/login'}">Open the Project Hub</a></div><div class="hg">${hubCards}</div></div></section>
      <div class="wrap"><section class="hsec"><div class="st"><div><div class="kick">TCD Instructors</div><h2>Meet the team</h2></div><a class="btn alt sm" href="#/instructors">Full profiles</a></div>
        <div class="ins">${D.instructors.map((p) => `<a class="inc" href="#/instructors"><div class="ph">${p.photo ? `<img src="${p.photo}" alt="${h(p.name)}">` : icon('UserTie')}</div><div><b>${h(p.name)}</b><span>${h(p.title)}</span><p>${h(p.short || '')}</p></div></a>`).join('')}</div></section></div>
      ${logoBand()}`;
  }
  const logoBand = () => `<div class="logoband"><div class="wrap"><img src="assets/img/ens-logo.png" alt="Emirates National Schools" style="height:46px"><i></i><img src="assets/img/tcc-logo.png" alt="Technology and Career Centers" style="height:64px"><i></i><img src="assets/img/discover.png" alt="Discover your talents and develop your skills" style="height:54px"></div></div>`;

  // ---------- about TCC ----------
  function about() {
    drawNav('about');
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / About TCC</div>
      <div class="about" style="margin-top:6px"><div><div class="kick">About TCC</div><h1 class="h2big" style="margin-top:6px">Technology and Career Center, Dubai</h1>
        <p class="justify">The Technology and Career Center (TCC) at Emirates National Schools gives students hands-on experience that matters for their future careers and everyday life. In a safe, well-equipped workshop, students design, build, test and present, using 3D printers, laser cutters, robots, Unimat Cool Tools and real hand tools.</p>
        <p class="justify">TCD is the applied-learning engine of ENS Dubai. It is not an extra activity: it is the curriculum made visible. Students turn science, maths, literacy and digital skills into real products, systems and prototypes, following the TCD Applied Design, Skills and Technologies Framework.</p></div>${vmCards()}</div>
      <div class="section-title"><h2>Our six-stage learning model</h2></div>
      <div class="grid g3">${[['Context and Problem', 'Start from a real need or a real place.'], ['Define and Plan', 'Write the brief, research and plan.'], ['Ideate and Prototype', 'Sketch ideas and build a first model.'], ['Test and Improve', 'Try it, find problems and fix them.'], ['Make and Share', 'Build the final product and present it.'], ['Reflect and Transfer', 'Think about what you learned and where to use it next.']].map(([t, d], i) => `<div class="card"><span class="chip ${i % 2 ? 'm' : ''}">${i + 1}</span><h3 style="margin-top:10px">${t}</h3><p class="muted small" style="margin:0">${d}</p></div>`).join('')}</div>
      <div class="section-title"><h2>Our skill areas</h2></div>${areasGrid()}
      <div class="section-title"><h2>Safety first</h2></div>
      <div class="card pad-l"><p class="justify" style="margin:0">Every student starts with a safety induction. We follow ISO 7010 safety signs, wear the right PPE for each machine (aprons, safety goggles and masks), and no machine starts until the teacher says yes.</p></div>`;
    app.insertAdjacentHTML('beforeend', logoBand());
  }

  // ---------- TCD Initiatives (everyone) ----------
  const INI = 'assets/initiatives/';
  const COMPS = [
    ['Dubai and UAE · January to February 2027', 'FIRST LEGO League UAE', 'The UAE Robotics Championship for school teams: Explore (ages 6 to 10) and Challenge (ages 9 to 16). Dubai rounds on 9 January and 16 to 17 January 2027, then the UAE final. Builds on our robotics and coding projects.', 'https://www.flluae.org/'],
    ['UAE · Ages 13 and under', 'Yas in Schools, Ethara Go', 'A national STEM and motorsport competition for UAE schools, run by Ethara, with finals at Yas Marina Circuit. Links to our design and engineering projects.', ''],
    ['UAE · KG to Grade 12 · Final in Dubai, 20 March 2027', 'STEAM Champions UAE 2026/2027', 'A national student competition in AI, robotics, drones and circular design, with a robotics lane for Grades 3 to 6. Online qualification by 20 February 2027. Registration closed on 31 October 2026, so late entry must be checked with the organiser.', 'https://edustream.ae/steam-champions-uae-2026-2027/'],
    ['UAE · Grades 3 to 8 · Free', 'Code Battle (UAE inter-school hackathon)', 'A free coding hackathon for teams of 2 or 3 students from UAE schools: Captain division for Grades 3 to 5 and Colonel for Grades 6 to 8, using block coding. The 2026 season has finished; watch for the 2027 season.', 'https://codebattle.tech/'],
    ['UAE · Ages 8 to 12', 'World Robot Olympiad UAE, Elementary', 'The UAE national qualifier of the World Robot Olympiad for school teams of up to three students with a coach. A pathway for a future TCD robotics team.', ''],
    ['UAE · Ages 7 to 12', 'Nature Champions, Emirates Nature-WWF', 'A UAE award scheme for primary students with learning, simulations and outdoor adventures. Links to the Photon eco mission and the hydroponics farm.', 'https://emiratesnaturewwf.ae/en/page/nature-champions'],
  ];
  const iniTeaser = () => `<section class="hsec"><div class="st"><div><div class="kick">TCD Initiatives</div><h2>Beyond the classroom</h2></div><a class="btn sm" href="#/initiatives">All initiatives</a></div>
    <div class="grid g3">${[['flag-board-progress.jpg', 'Signature for UAE Flag', 'A whole-school community flag of thumbprints, from Flag Day to UAE National Day.', 'center 30%'], ['workshop-candles.jpg', 'Workshops for teachers and parents', 'Candle and soap making, with 3D design, Cool Tools and laser cutting coming next.', 'center 55%'], ['garden-concept.jpg', 'Coming soon: garden and hydroponics', 'A TCD school garden and a Grade 6 hydroponics farm built by students.', 'center']].map(([img, t, d, pos]) => `<a class="inic" href="#/initiatives"><img src="${INI}${img}" alt="${h(t)}" loading="lazy" style="object-position:${pos}"><div><b>${h(t)}</b><p>${h(d)}</p></div></a>`).join('')}</div></section>`;
  function initiatives() {
    drawNav('ini');
    const fig = (src, cap, cls = '', pos = 'center') => `<figure class="${cls}"><img src="${INI}${src}" alt="${h(cap)}" loading="lazy" style="object-position:${pos}"><figcaption>${h(cap)}</figcaption></figure>`;
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / TCD Initiatives</div>
      <div class="lesson-head"><div><h1>TCD Initiatives</h1><p class="muted" style="margin:0">How the Technology and Career Center Dubai brings students, teachers and parents together to design, make and celebrate.</p></div></div>

      <section class="ini"><div class="ini-text"><div class="kick">Whole-school initiative</div><h2>Signature for UAE Flag</h2>
        <p class="justify">A whole-school initiative led by TCD. Students, teachers and parents press a thumbprint on a small wooden piece in a UAE flag colour and place it on a community flag. Every piece was designed and laser cut in the TCD workshop.</p>
        <p class="justify">The initiative started on UAE Flag Day with thumbprints from students, teachers and parents, and the school community will finish the flag together on UAE National Day.</p>
        <div class="tl"><span class="chip">3 November · Flag Day: launch</span><span class="arrow">${icon('ArrowRight')}</span><span class="chip m">2 December · UAE National Day: flag completed</span></div></div>
        <div class="ini-ph">${fig('flag-board-progress.jpg', 'The community flag taking shape', 'wide')}${fig('flag-board-start.jpg', 'Laser-cut pieces with thumbprints')}${fig('flag-poster.jpg', 'Signature for UAE Flag poster')}</div></section>

      <section class="ini rev"><div class="ini-text"><div class="kick">Community workshops</div><h2>Workshops for teachers and parents</h2>
        <ul class="ticks"><li><b>Done:</b> a candle making and soap making workshop for teachers and parents, run by the TCD team. Participants worked hands-on with moulds, wax colours and wicks to make their own products.</li>
        <li><b>Coming next:</b> more trainings in 3D design, Cool Tools and laser cutting, where teachers and parents will make products such as a Sheikh Zayed photo collage.</li></ul></div>
        <div class="ini-ph">${fig('workshop-candles.jpg', 'Candles ready for the workshop', 'tall', 'center 60%')}${fig('workshop-setup.jpg', 'Moulds, wicks and tools set out')}${fig('workshop-moulds.jpg', 'Coloured candles setting in moulds')}</div></section>

      <section class="ini"><div class="ini-text"><div class="kick">Ongoing preparations</div><h2>UAE National Day</h2>
        <ul class="ticks"><li>Completing the Signature for UAE Flag with students, teachers and parents.</li>
        <li>Making stations: laser-cut keychains with names engraved live, UAE-colour gift candles, letter-stamping jewellery and a tile flag.</li>
        <li>Supporting parents with their large laser-cut UAE map display: TCD is making the frames for the official leaders' portrait collage, to be finished within two weeks.</li></ul></div>
        <div class="ini-text"><div class="kick">Coming soon</div><h2>TCD School Garden and hydroponics</h2>
        <ul class="ticks"><li><b>Garden design concept:</b> 14 × 14 m, six planting beds, two planting tables and an outdoor classroom for 25. Entrance location to be confirmed.</li>
        <li><b>Grade 6 hydroponics farm:</b> students will build it with wooden planters, 3D printed connectors for the watering system and laser-engraved signs.</li></ul></div></section>
      <figure class="ini-hero"><img src="${INI}garden-concept.jpg" alt="TCD School Garden design concept" loading="lazy"></figure>

      <div class="section-title"><h2>Competition opportunities 2026–2027</h2></div>
      <p class="muted" style="margin-top:-6px">UAE competitions open to students from UAE schools, chosen to match our Grade 4 to 6 projects. Dates and rules are confirmed with each organiser before registering.</p>
      <div class="grid comps">${COMPS.map(([where, name, d, url], i) => `<div class="card comp"><span class="chip ${i % 2 ? 'm' : ''}">${h(where)}</span><h3>${h(name)}</h3><p class="muted small">${h(d)}</p>${url ? `<a class="small" href="${url}" target="_blank" rel="noopener">Official page ${icon('ArrowRight')}</a>` : ''}</div>`).join('')}</div>`;
    app.insertAdjacentHTML('beforeend', logoBand());
  }

  // ---------- Student Projects Gallery ----------
  async function gallery() {
    drawNav('gallery');
    let filter = 'all';
    const render = (uploaded) => {
      const all = D.gallery.concat(uploaded);
      const tags = ['all'].concat([...new Set(all.map((g) => g.tag).filter(Boolean))]);
      const list = all.filter((g) => filter === 'all' || g.tag === filter);
      app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / Student Projects Gallery</div>
        <div class="lesson-head"><div><h1>Student Projects Gallery</h1><p class="muted" style="margin:0">Photos and videos of work made by TCD students. Student faces and names are blurred to keep everyone safe.</p></div>${isInst() ? `<button class="btn gold" id="up">${icon('Upload')} Add photos or videos</button>` : ''}</div>
        <div class="seg" style="margin-bottom:16px;flex-wrap:wrap">${tags.map((t) => `<button data-t="${h(t)}" class="${t === filter ? 'on' : ''}">${t === 'all' ? 'All' : h(t)}</button>`).join('')}</div>
        <div class="masonry">${list.map((g, i) => `<figure class="mz" data-i="${all.indexOf(g)}">${g.type === 'video' ? `<div class="vwrap"><img src="${g.thumb || ''}" alt="${h(g.title)}" loading="lazy"><span class="play">${icon('Play')}</span></div>` : `<img src="${g.src}" alt="${h(g.title)}" loading="lazy">`}<figcaption><b>${h(g.title)}</b><span>${h(g.sub || '')}</span>${isInst() && g.id ? `<button class="btn alt sm del" data-del="${h(g.id)}">${icon('Trash')}</button>` : ''}</figcaption></figure>`).join('') || '<p class="muted">No items yet.</p>'}</div>`;
      app.querySelectorAll('.seg button').forEach((b) => (b.onclick = () => { filter = b.dataset.t; render(uploaded); }));
      app.querySelectorAll('.mz').forEach((f) => (f.onclick = (e) => { if (e.target.closest('.del')) return; lightbox(all[+f.dataset.i]); }));
      app.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => { if (!confirm('Remove this item from the gallery?')) return; try { await API.call('deleteMedia', { token: auth.token, id: b.dataset.del }); load(); } catch (e) { toast(e.message); } }));
      const up = app.querySelector('#up'); if (up) up.onclick = uploadModal;
    };
    const lightbox = (g) => {
      const m = document.createElement('div'); m.className = 'modal lb';
      m.innerHTML = `<div class="box" style="max-width:min(960px,96vw)">${g.type === 'video' ? (g.src ? `<video src="${g.src}" controls autoplay playsinline style="width:100%;max-height:75vh;border-radius:10px;background:#000"></video>` : `<iframe src="${g.embed}" allow="autoplay" style="width:100%;aspect-ratio:16/9;border:0;border-radius:10px"></iframe>`) : `<img src="${g.full || g.src}" alt="${h(g.title)}" style="width:100%;max-height:75vh;object-fit:contain;border-radius:10px">`}<h3 style="margin-top:12px">${h(g.title)}</h3><p class="muted" style="margin:0">${h(g.sub || '')}</p><div class="btns" style="justify-content:flex-end"><button class="btn alt" id="c">Close</button></div></div>`;
      document.body.appendChild(m); m.onclick = (e) => { if (e.target === m || e.target.id === 'c') m.remove(); };
    };
    const uploadModal = () => {
      const m = document.createElement('div'); m.className = 'modal';
      const projs = Object.entries(D.projects).filter(([, p]) => p.pool === 'full');
      m.innerHTML = `<div class="box"><h2>Add to the gallery</h2><p class="muted small">Photos and short videos are saved to the TCD Google Drive folder. Please blur student faces and names before you upload.</p>
        <div class="field"><label class="f">Photo or video</label><input class="i" type="file" id="file" accept="image/*,video/*" required></div>
        <div class="field"><label class="f">Caption</label><input class="i" id="cap" maxlength="140" placeholder="For example: Grade 6 shadow candle holders"></div>
        <div class="row2"><div class="field"><label class="f">Grade</label><select class="i" id="gr"><option value="">Any</option><option>4</option><option>5</option><option>6</option></select></div><div class="field"><label class="f">Project</label><select class="i" id="pj"><option value="">Other</option>${projs.map(([id, p]) => `<option value="${id}">${h(p.name)}</option>`).join('')}</select></div></div>
        <div id="st" class="small muted"></div><div class="btns"><button class="btn alt" id="c">Cancel</button><button class="btn" id="ok">${icon('Upload')} Upload</button></div></div>`;
      document.body.appendChild(m);
      m.querySelector('#c').onclick = () => m.remove();
      m.querySelector('#ok').onclick = async () => {
        const f = m.querySelector('#file').files[0]; if (!f) { toast('Choose a file first'); return; }
        if (f.size > 45 * 1024 * 1024) { toast('Please keep files under 45 MB'); return; }
        const btn = m.querySelector('#ok'); btn.disabled = true; m.querySelector('#st').textContent = 'Uploading, please wait...';
        try {
          const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
          await API.call('uploadMedia', { token: auth.token, data, mime: f.type, name: f.name, caption: m.querySelector('#cap').value, grade: m.querySelector('#gr').value, projectId: m.querySelector('#pj').value });
          m.remove(); toast('Added to the gallery'); load();
        } catch (e) { m.querySelector('#st').textContent = e.message; btn.disabled = false; }
      };
    };
    const toItem = (x) => {
      const P = D.projects[x.projectId] || {}; const title = x.caption || P.name || 'Student project'; const sub = [x.grade ? 'Grade ' + x.grade : '', P.name || ''].filter(Boolean).join(', ');
      if (x.dataUrl) return { id: x.id, type: x.type, src: x.dataUrl, thumb: x.type === 'video' ? '' : x.dataUrl, title, sub, tag: x.grade ? 'Grade ' + x.grade : 'More' };
      return { id: x.id, type: x.type, src: x.type === 'video' ? '' : `https://drive.google.com/thumbnail?id=${x.fileId}&sz=w1200`, full: `https://drive.google.com/thumbnail?id=${x.fileId}&sz=w2000`, thumb: `https://drive.google.com/thumbnail?id=${x.fileId}&sz=w800`, embed: `https://drive.google.com/file/d/${x.fileId}/preview`, title, sub, tag: x.grade ? 'Grade ' + x.grade : 'More' };
    };
    const load = async () => { let up = []; try { up = ((await API.call('gallery', {})).items || []).map(toItem); } catch (e) { } render(up); };
    render([]); load();
  }

  // ---------- Skills Games ----------
  function games(lessonId) {
    drawNav('hub');
    const L = lessonId && D.lessons[lessonId];
    const list = L ? Games.forLesson(L).map(Games.byId) : Games.LIST;
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / ${L ? `<a href="#/lesson/${L.id}">Grade ${L.grade} Week ${L.week}</a> / ` : ''}Skills Games</div>
      <div class="lesson-head"><div><h1>Skills Games</h1><p class="muted" style="margin:0">${L ? `Games for ${h(L.title)}. Keyword games use this lesson's key words.` : 'Short games that practise workshop, design and coding skills. Play alone to practise, or start a live game: students scan the QR code, join with their name and see a scoreboard at the end. Nothing is saved.'}</p></div><a class="btn alt" href="#/play">${icon('Gamepad')} I have a game code</a></div>
      ${!L ? `<div class="filters" style="margin-bottom:14px"><select class="i" id="ls" style="max-width:420px"><option value="">Keyword games: choose a lesson for its key words</option>${Object.values(D.lessons).filter((l) => !l.isAssessment).map((l) => `<option value="${l.id}">Grade ${l.grade} Week ${l.week}: ${h(l.title)}</option>`).join('')}</select></div>` : ''}
      <div class="grid g3">${list.map((g) => `<div class="card gamecard"><div class="gi" style="background:${g.col}">${icon(g.ic)}</div><h3>${h(g.n)}</h3><p class="muted small">${h(g.d)}</p><div class="btns" style="margin-top:auto"><button class="btn alt sm" data-p="${g.id}">${icon('Play')} Practise</button>${isStaff() ? `<button class="btn gold sm" data-h="${g.id}">${icon('Users')} Start live game</button>` : ''}</div></div>`).join('')}</div>
      <div id="solo"></div>`;
    const lesson = () => L || (app.querySelector('#ls') && D.lessons[app.querySelector('#ls').value]) || null;
    app.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => {
      const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="box" style="max-width:860px;width:96vw"><div class="btns" style="justify-content:flex-end;margin:0 0 8px"><button class="btn alt sm" id="x">${icon('Times')} Close</button></div><div id="gs"></div></div>`;
      document.body.appendChild(m); const r = Games.runGame(m.querySelector('#gs'), b.dataset.p, lesson()); current = r; m.querySelector('#x').onclick = () => { r.destroy(); m.remove(); current = null; };
    }));
    app.querySelectorAll('[data-h]').forEach((b) => (b.onclick = async () => {
      const g = Games.byId(b.dataset.h); const l = lesson();
      if (g.lesson && !l) { toast('Choose a lesson first, so the game uses its key words'); const s = app.querySelector('#ls'); s && s.focus(); return; }
      try { const r = await API.call('gameCreate', { token: auth.token, gameId: g.id, lessonId: l ? l.id : '' }); location.hash = '#/ghost/' + r.game.code; } catch (e) { toast(e.message); }
    }));
  }

  // ---------- login ----------
  function login() {
    drawNav('login');
    let who = 'lubna';
    app.innerHTML = `<div style="max-width:560px;margin:0 auto"><div class="card pad-l">
      <h1>Staff and Guest Login</h1><p class="muted">Choose your account and enter your password.</p>
      <div id="err"></div>
      <div class="grid g3" id="who" style="margin-bottom:16px;gap:10px">
        ${[['lubna', 'Ms. Lubna', 'Instructor', 'UserTie'], ['dilan', 'Mr. Dilan', 'Instructor', 'UserTie'], ['guest', 'Guest', 'View only', 'Eye']].map(([k, n, r, ic]) => `<button type="button" class="card" data-k="${k}" style="cursor:pointer;text-align:center;padding:14px;border-width:2px;${k === who ? 'border-color:var(--teal)' : ''}"><div style="font-size:24px;color:var(--teal)">${icon(ic)}</div><b style="font-family:var(--head)">${n}</b><div class="small muted">${r}</div></button>`).join('')}
      </div>
      <form id="f"><div class="field"><label class="f" for="pw">Password</label><input class="i" type="password" id="pw" required autocomplete="current-password"></div>
      <button class="btn lg" style="width:100%" id="go">${icon('SignInAlt')} Log in</button></form>
      <p class="small muted" style="margin-top:14px">Students do not need to log in. Use <a href="#/join">Join a Quiz</a> or <a href="#/me">My Results</a>.</p></div></div>`;
    app.querySelectorAll('#who [data-k]').forEach((b) => (b.onclick = () => { who = b.dataset.k; app.querySelectorAll('#who [data-k]').forEach((x) => (x.style.borderColor = x === b ? 'var(--teal)' : '')); app.querySelector('#pw').focus(); }));
    app.querySelector('#f').onsubmit = async (e) => {
      e.preventDefault(); const go = app.querySelector('#go'); go.disabled = true;
      try { const r = await API.call('login', { user: who, password: app.querySelector('#pw').value }); auth = { token: r.token, user: r.user, at: Date.now() }; store.set('tcd_auth', auth); location.hash = '#/'; }
      catch (er) { app.querySelector('#err').innerHTML = `<div class="err">${h(er.message)}</div>`; go.disabled = false; }
    };
  }

  // ---------- grade term plan ----------
  function grade(g) {
    drawNav('g' + g);
    const G = D.grades[g]; if (!G) { app.innerHTML = '<p>Grade not found.</p>'; return; }
    const cw = currentWeek();
    const projs = []; G.plan.forEach((w) => { if (w.project && !projs.includes(w.project)) projs.push(w.project); });
    const legend = projs.map((p) => `<a href="#/project/${p}" class="chip" style="background:${pcol(p)}1a;color:${pcol(p)}">${icon(PICON[p] || 'Tools')} ${h(D.projects[p].name)}</a>`).join('');
    const weeks = G.plan.map((w) => {
      if (w.break) return `<div class="wk brk"><div class="wnum"><b>${w.week}</b><span>${h(w.dates)}</span></div><div><h3>Mid-term break</h3><p>${h(D.notes[w.week] || '')}</p></div><div class="status"><span class="chip grey">No lessons</span></div></div>`;
      const href = w.project === 'term1-showcase' ? '#/assessment' : w.lessonId ? `#/lesson/${w.lessonId}` : `#/week/${g}/${w.week}`;
      const st = w.project === 'term1-showcase' ? `<span class="chip green">${icon('Award')} Assessment</span>` : w.lessonId ? `<span class="chip green">${icon('Check')} Full lesson pack</span>` : w.files.length ? `<span class="chip">${w.files.length} files</span>` : `<span class="chip grey">Plan</span>`;
      return `<a class="wk" href="${href}"><span class="dot" style="background:${pcol(w.project)}"></span><div class="wnum"><b>${w.week}</b><span>${h(w.dates)}</span></div>
        <div><div class="small" style="color:${pcol(w.project)};font-weight:700;font-family:var(--head)">${h(D.projects[w.project].name)}</div><h3>${h(w.title)}</h3><p>${h(w.text)}</p>${D.notes[w.week] ? `<p class="small muted" style="margin-top:4px">${h(D.notes[w.week])}</p>` : ''}</div>
        <div class="status">${cw === w.week ? '<span class="chip now-tag">This week</span>' : ''}${st}</div></a>`;
    }).join('');
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / Grade ${g}</div>
      <div class="lesson-head"><div><h1>Grade ${g}: Term Plans</h1><p class="muted" style="margin:0">${h(G.course)} | Each session: ${h(G.session)}</p></div>
      <div class="btns"><a class="btn alt" href="#/pool">${icon('Tools')} Project Pool</a></div></div>
      <div class="card" style="margin-bottom:18px"><p class="justify" style="margin-bottom:10px">${h(G.summary)}</p><div class="legend">${legend}</div></div>
      <div class="seg" style="margin-bottom:14px" id="terms"><button class="on" data-t="1">Term 1</button><button data-t="2">Term 2</button><button data-t="3">Term 3</button></div>
      <div id="tplan"></div><div class="timeline" id="t1">${weeks}<div class="wk brk"><div class="wnum"><b>15</b><span>${h(D.weeks[15])}</span></div><div><h3>Term 1 assessments</h3><p>${h(D.notes[15])}</p></div><div class="status"><span class="chip grey">No lessons</span></div></div></div>`;
    app.querySelectorAll('#terms button').forEach((b) => (b.onclick = () => { app.querySelectorAll('#terms button').forEach((x) => x.classList.toggle('on', x === b)); const t = b.dataset.t; app.querySelector('#t1').style.display = t === '1' ? '' : 'none'; if (t === '1') app.querySelector('#tplan').innerHTML = ''; else termPlanner(g, t, app.querySelector('#tplan')); }));
  }

  // ---------- week without a full pack ----------
  function week(g, w) {
    drawNav('g' + g);
    const e = (D.grades[g] || { plan: [] }).plan.find((x) => x.week == w);
    if (!e) { app.innerHTML = '<p>Week not found.</p>'; return; }
    const P = D.projects[e.project];
    app.innerHTML = `<div class="crumbs"><a href="#/grade/${g}">Grade ${g}</a> / Week ${w}</div>
      <div class="chip" style="background:${pcol(e.project)}1a;color:${pcol(e.project)}">${h(P.name)}</div>
      <h1 style="margin-top:10px">${h(e.title)}</h1><div class="meta"><span class="chip grey">${icon('CalendarAlt')} Week ${w} | ${h(e.dates)}</span><span class="chip grey">${icon('RegClock')} ${h(D.grades[g].session)}</span></div>
      <div class="grid g2" style="margin-top:20px"><div class="card pad-l"><h3>Plan</h3><p class="justify">${h(e.text)}</p><p class="small muted">This week was taught before the hub went live. Its full lesson pack (slides, lesson plan, planner, worksheet, hook video and quiz) is being added.</p><a class="btn alt sm" href="#/project/${e.project}">About this project</a></div>
      <div class="card pad-l"><h3>Files in use</h3>${e.files.length ? `<div class="downloads">${e.files.map((f) => dl(f.file, f.label)).join('')}</div>` : '<p class="muted">No files uploaded for this week yet.</p>'}</div></div>`;
  }

  function dl(file, label) {
    if (!file) return '';
    const ext = file.split('.').pop().toLowerCase();
    const cls = { docx: 'w', pptx: 'p', pdf: 'pdf', xlsx: 'x' }[ext] || 'w';
    const ic = { docx: 'FileWord', pptx: 'FilePowerpoint', pdf: 'FilePdf', xlsx: 'FileExcel' }[ext] || 'Download';
    return `<a class="dl" href="files/${encodeURIComponent(file)}" download><span class="fi ${cls}">${icon(ic)}</span><span><b>${h(label)}</b><span>${h(file)}</span></span></a>`;
  }

  // ---------- lesson ----------
  const TABS = [['overview', 'Overview', 'InfoCircle'], ['hook', 'Hook', 'Play'], ['slides', 'Slides', 'FilePowerpoint'], ['plan', 'Lesson Plan', 'FileWord'], ['planner', 'Weekly Planner', 'CalendarAlt'], ['study', 'Study Material', 'BookOpen'], ['warmup', 'Warm-up', 'Running'], ['worksheet', 'Worksheet', 'ClipboardList'], ['quiz', 'Live Quiz', 'Bolt'], ['games', 'Games', 'Gamepad']];
  function lesson(id, tab) {
    const L = D.lessons[id]; if (!L) { app.innerHTML = '<p>Lesson not found.</p>'; return; }
    drawNav('g' + L.grade);
    const P = D.projects[L.project];
    tab = tab || 'overview';
    const grd = D.grades[L.grade];
    const projWeeks = grd.plan.filter((w) => w.project === L.project);
    app.innerHTML = `<div class="crumbs"><a href="#/grade/${L.grade}">Grade ${L.grade}</a> / <a href="#/project/${L.project}">${h(P.name)}</a> / Week ${L.week}</div>
      <div class="lesson-head"><div>
        <div class="chip" style="background:${pcol(L.project)}1a;color:${pcol(L.project)}">${icon(PICON[L.project] || 'Tools')} ${h(P.name)}</div>
        <h1 style="margin-top:10px">${h(L.title)}</h1>
        <div class="meta"><span class="chip grey">Grade ${L.grade}</span><span class="chip grey">${icon('CalendarAlt')} Week ${L.week} | ${h(L.dates)}</span><span class="chip grey">${icon('RegClock')} ${L.minutes} minutes</span><span class="chip grey">Session ${projWeeks.findIndex((w) => w.week === L.week) + 1} of ${projWeeks.length}</span></div>
      </div><div class="btns">${isInst() ? `<button class="btn gold" id="startQuiz">${icon('Gamepad')} Start live quiz</button>` : ''}<button class="btn alt" id="present">${icon('Expand')} Present slides</button></div></div>
      <div class="tabs" role="tablist">${TABS.map(([k, n, ic]) => `<button role="tab" data-t="${k}" class="${k === tab ? 'on' : ''}">${icon(ic)} ${n}</button>`).join('')}</div>
      <div id="tab"></div>`;
    app.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => { history.replaceState(null, '', `#/lesson/${id}/${b.dataset.t}`); app.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b)); showTab(L, P, b.dataset.t); }));
    const sq = app.querySelector('#startQuiz'); if (sq) sq.onclick = () => startQuiz(L);
    app.querySelector('#present').onclick = () => { app.querySelector('[data-t=slides]').click(); setTimeout(() => { const v = app.querySelector('.viewer'); v && v.requestFullscreen && v.requestFullscreen(); }, 50); };
    showTab(L, P, tab);
  }

  function startQuiz(L) {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box"><h2>Start a live quiz</h2><p class="muted">Week ${L.week}: ${h(L.title)} | ${L.quiz.length} questions</p>
      <div class="field"><label class="f">Class section (optional)</label><input class="i" id="sec" placeholder="For example ${L.grade}BA"></div>
      <div class="btns"><button class="btn alt" id="c">Cancel</button><button class="btn gold" id="ok">${icon('Play')} Create quiz code</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector('#c').onclick = () => m.remove();
    m.querySelector('#ok').onclick = async () => {
      try { const r = await API.call('createSession', { token: auth.token, lessonId: L.id, projectId: L.project, grade: L.grade, section: m.querySelector('#sec').value }); m.remove(); location.hash = '#/host/' + r.session.code; }
      catch (e) { if (/log in/i.test(e.message)) { auth = null; store.del('tcd_auth'); m.remove(); location.hash = '#/login'; } else toast(e.message); }
    };
  }

  function showTab(L, P, t) {
    if (current && current.destroy) current.destroy(); current = null;
    const el = app.querySelector('#tab'); const F = L.files;
    const S = L.structure; const order = [['starter', 'Starter', '#0A5C5F'], ['ido', 'I Do', '#0E7C80'], ['wedo', 'We Do', '#3A6EA5'], ['youdo', 'You Do', '#9E1B4B'], ['closure', 'Closure', '#D49A12']];
    const views = {
      overview() {
        const tot = order.reduce((s, [k]) => s + S[k].minutes, 0);
        el.innerHTML = `<div class="grid" style="grid-template-columns:1.5fr 1fr;align-items:start" id="ovg">
          <div class="grid">
            <div class="card pad-l"><h3>Project plan for this session</h3><p class="justify">${h(L.description)}</p>
              <h3 style="margin-top:16px">${L.grade == 6 ? 'Learning objective' : 'Learning objective (WALT)'}</h3><p>${h(L.walt)}</p>
              <h3>${L.grade == 6 ? 'Success criteria' : 'Success criteria (WILF)'}</h3><ul class="ticks">${L.wilf.map((x) => `<li>${h(x)}</li>`).join('')}</ul></div>
            <div class="card pad-l"><h3>Timeline (${tot} minutes)</h3>
              <div class="struct">${order.map(([k, n, c]) => `<div style="flex:${S[k].minutes};background:${c}" title="${n}: ${S[k].minutes} min">${n} ${S[k].minutes}'</div>`).join('')}</div>
              ${order.map(([k, n, c]) => `<p style="margin-bottom:8px"><b style="color:${c}">${n} (${S[k].minutes} min):</b> ${h(S[k].text.join(' '))}</p>`).join('')}</div>
          </div>
          <div class="grid">
            <div class="card"><h3>Required materials</h3><ul class="clean">${L.resources.map((x) => `<li>${h(x)}</li>`).join('')}</ul></div>
            <div class="card"><h3>Downloads</h3><div class="downloads" style="grid-template-columns:1fr">${dl(F.pptx, 'Slides (PowerPoint)')}${dl(F.planDocx, 'Lesson Plan (Word)')}${dl(F.planPdf, 'Lesson Plan (PDF)')}${dl(F.plannerDocx, 'Weekly Planner (Word)')}${dl(F.plannerPdf, 'Weekly Planner (PDF)')}${dl(F.wsDocx, 'Worksheet (Word)')}${dl(F.wsPdf, 'Worksheet (PDF)')}${(L.extraFiles || []).map((x) => dl(x.file, x.label)).join('')}</div></div>
            <div class="card"><h3>Project timeline</h3>${D.grades[L.grade].plan.filter((w) => w.project === L.project).map((w) => `<p style="margin-bottom:6px">${w.week === L.week ? '<b>' : ''}<a href="${w.lessonId ? '#/lesson/' + w.lessonId : '#/week/' + L.grade + '/' + w.week}">Week ${w.week}</a>: ${h(w.title)}${w.week === L.week ? '</b>' : ''}</p>`).join('')}</div>
          </div></div>`;
        if (window.innerWidth < 900) el.querySelector('#ovg').style.gridTemplateColumns = '1fr';
      },
      hook() {
        const V = L.hook.video || {}; const idm = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/.exec(V.url || '');
        const vids = (L.videos || []).filter((v) => v.url && v.url !== V.url);
        el.innerHTML = `<div id="hp"></div>
          <div class="grid g2" style="margin-top:18px;align-items:start">
            <div class="card" id="ytbox"><h3>${icon('Youtube')} Short video: ${h(V.title || '')}</h3>${idm ? `<div style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;margin-bottom:10px;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${idm[1]}${/list=([\w-]+)/.test(V.url) ? '?list=' + /list=([\w-]+)/.exec(V.url)[1] : ''}" style="width:100%;height:100%;border:0" allowfullscreen title="${h(V.title || 'Hook video')}"></iframe></div><p class="small" style="margin:0"><a href="${h(V.url)}" target="_blank" rel="noopener">Open on YouTube</a></p>` : '<p class="muted small">No video for this lesson.</p>'}
              <p class="small muted" style="margin:8px 0 0">Watch every video in full and check it against school and UAE norms before showing it to students.</p></div>
            <div class="card"><h3>${icon('QuestionCircle')} How to use the hook</h3><ol class="clean"><li>Show the hook screen on the board and read the question (or press the speaker button).</li><li>Pairs talk for 30 seconds. The timer is on the second screen.</li><li>Take two or three answers, then play the short video.</li></ol>
              ${vids.length ? `<h3 style="margin-top:14px">More videos for this lesson</h3><ul class="clean">${vids.map((v) => `<li><a href="${h(v.url)}" target="_blank" rel="noopener">${icon('Youtube')} ${h(v.title)}</a></li>`).join('')}</ul>` : ''}</div>
          </div>`;
        current = HookPlayer(el.querySelector('#hp'), L, P);
      },
      slides() {
        const decks = L.decks && L.decks.length ? L.decks : [{ label: 'Slides', dir: L.slideDir, from: 1, to: L.slides, file: F.pptx }];
        let di = 0;
        const draw = () => {
          const dk = decks[di]; const n = dk.to - dk.from + 1; let i = 1;
          const src = (k) => `${dk.dir}/s-${String(dk.from + k - 1).padStart(2, '0')}.jpg`;
          el.innerHTML = `${decks.length > 1 ? `<div class="seg" style="margin-bottom:12px">${decks.map((d, k) => `<button data-d="${k}" class="${k === di ? 'on' : ''}">${h(d.label)}</button>`).join('')}</div>` : ''}
            <div class="viewer" tabindex="0"><div class="stage"><img id="si" src="${src(1)}" alt="Slide 1"></div>
            <div class="bar"><button class="btn alt sm" id="pv">${icon('ChevronLeft')}</button><span id="sn">1 / ${n}</span><button class="btn alt sm" id="nx">${icon('ChevronRight')}</button>
            <span style="flex:1"></span><button class="btn alt sm" id="fs">${icon('Expand')} Full screen</button>${dk.file ? `<a class="btn gold sm" href="files/${dk.file}" download>${icon('Download')} PowerPoint</a>` : ''}</div>
            <div class="thumbs">${Array.from({ length: n }, (_, k) => `<img src="${src(k + 1)}" data-k="${k + 1}" alt="Slide ${k + 1}" loading="lazy" class="${k === 0 ? 'on' : ''}">`).join('')}</div></div>
            <p class="small muted" style="margin-top:10px">Use the arrow keys to move between slides. Speaker notes are inside the PowerPoint file.${dk.from > 1 || dk.to < dk.total ? ` These are slides ${dk.from} to ${dk.to} of the full project deck.` : ''}</p>`;
          const v = el.querySelector('.viewer');
          const go = (k) => { i = Math.min(n, Math.max(1, k)); el.querySelector('#si').src = src(i); el.querySelector('#sn').textContent = `${i} / ${n}`; el.querySelectorAll('.thumbs img').forEach((t) => t.classList.toggle('on', +t.dataset.k === i)); };
          el.querySelector('#pv').onclick = () => go(i - 1); el.querySelector('#nx').onclick = () => go(i + 1);
          el.querySelector('#si').onclick = () => go(i + 1);
          el.querySelectorAll('.thumbs img').forEach((t) => (t.onclick = () => go(+t.dataset.k)));
          el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { di = +b.dataset.d; cleanup(); draw(); }));
          el.querySelector('#fs').onclick = () => (document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen && v.requestFullscreen());
          const key = (e) => { if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(i - 1); };
          document.addEventListener('keydown', key); cleanup = () => document.removeEventListener('keydown', key);
        };
        let cleanup = () => { };
        draw(); current = { destroy() { cleanup(); } };
      },
      plan() {
        el.innerHTML = `<div class="btns" style="margin-bottom:14px">${F.planDocx ? `<a class="btn" href="files/${F.planDocx}" download>${icon('FileWord')} Download Word</a>` : ''}${F.planPdf ? `<a class="btn maroon" href="files/${F.planPdf}" download>${icon('FilePdf')} Download PDF</a>` : ''}</div>
        <div class="doc"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><img src="assets/img/ens-logo.png" style="height:34px" alt="ENS"><h2 style="margin:0">Lesson Plan</h2></div>
          <table><tr><td><b>Teacher Name:</b><br>Ms. Lubna Kakkengal and Mr. Dilan Devendra</td><td><b>Class/Section:</b><br>Grade ${L.grade}</td></tr><tr><td><b>Subject:</b><br>TCD: ${h(P.name)}</td><td><b>Date:</b> Week ${L.week} (${h(L.dates)} 2026)<br><b>Time:</b> ${L.minutes === 90 ? '1 hour 30 minutes' : L.minutes / 60 + ' hours'}</td></tr><tr><td colspan="2"><b>Class Description:</b><br><span class="justify">${h(L.description)}</span></td></tr></table>
          <table class="groups"><tr><th colspan="4">Differentiated Learning Groups (Data)</th></tr><tr><td style="background:#00a2e8">Desert Fox</td><td style="background:#92d050">Camel</td><td style="background:#ffc000">Oryx</td><td style="background:#ff0000">Falcon</td></tr><tr>${['desert_fox', 'camel', 'oryx', 'falcon'].map((k) => `<td style="text-align:left;vertical-align:top;font-weight:400;color:var(--ink);background:#fff">${(L.groups[k] || []).map((x) => '&bull; ' + h(x)).join('<br>')}</td>`).join('')}</tr></table>
          <table><tr><th colspan="2">Lesson Overview</th></tr>
            ${[['Lesson Topic', L.title], ['Standard(s)', L.standards], [L.grade == 6 ? 'Learning Objective(s)' : 'Learning Objective(s) (WALT)', L.walt], [L.grade == 6 ? 'Success Criteria' : 'Success Criteria (WILF)', L.wilf.join(' | ')], ['Literacy Strategies', L.literacy], ['Assessment', L.assessment], ['Targeted Vocabulary', L.vocab.join(', ')], ['Skills', L.skills], ['National Identity Integration', L.national_identity], ['AI/Digital Learning', L.digital]].map(([k, v]) => `<tr><td class="k">${k}</td><td>${h(v)}</td></tr>`).join('')}</table>
          <table><tr><th colspan="2">Lesson Structure</th></tr>
            ${order.map(([k, n]) => `<tr><td class="k">${n}<br><span class="muted">(${S[k].minutes} minutes)</span></td><td>${S[k].text.map((x) => `<p>${h(x)}</p>`).join('')}</td></tr>`).join('')}
            <tr><td class="k">Differentiated Instruction</td><td><p><b>Beginning:</b> ${h(L.levels.beginning)}</p><p><b>On:</b> ${h(L.levels.on)}</p><p><b>Above:</b> ${h(L.levels.above)}</p></td></tr></table>
          <table><tr><th colspan="2">Inclusive Planning</th></tr><tr><td class="k">Notes</td><td>${h(L.inclusive_notes)}</td></tr><tr><td class="k">Inclusion / EAL Support</td><td>${h(L.inclusion.join(', '))}</td></tr><tr><td class="k">G&amp;T / Extension</td><td>${h(L.gt.join(', '))}</td></tr></table></div>`;
      },
      planner() {
        el.innerHTML = `<div class="btns" style="margin-bottom:14px">${F.plannerDocx ? `<a class="btn" href="files/${F.plannerDocx}" download>${icon('FileWord')} Download Word</a>` : ''}${F.plannerPdf ? `<a class="btn maroon" href="files/${F.plannerPdf}" download>${icon('FilePdf')} Download PDF</a>` : ''}</div>
          <div class="doc"><p><b>Grade: ${L.grade} | Term 1, Week ${L.week} (${h(L.dates)}) | TCD: ${h(D.grades[L.grade].course)} | Session length: ${L.minutes} minutes</b></p>
          <table>${[['T1 WEEK: ' + L.week, 'Lesson 1: ' + L.title], ['Standard(s)', L.standards], ['Literacy Strategies', L.literacy], ['Assessment', L.assessment], [L.grade == 6 ? 'Objectives' : 'WALT (Learning Target)', L.walt], [L.grade == 6 ? 'Success Criteria' : 'WILF (Success Criteria)', L.wilf.join(' | ')], ['Targeted Vocabulary', L.vocab.join(', ')], ['Resources', L.resources.join(', ')], ['National Identity Integration', L.national_identity], ['AI/Digital Learning', L.digital], ['I Do', S.ido.text.join(' ')], ['We Do', S.wedo.text.join(' ')], ['You Do', S.youdo.text.join(' ')], ['Differentiated Instruction', `Beginning: ${L.levels.beginning} On: ${L.levels.on} Above: ${L.levels.above}`], ['Closure/Reflection', S.closure.text.join(' ')], ['Inclusion / EAL Support', L.inclusion.join(', ')], ['G&T / Extension', L.gt.join(', ')]].map(([k, v], i) => `<tr><td class="k">${h(k)}</td><td>${i === 0 ? '<b>' + h(v) + '</b>' : h(v)}</td></tr>`).join('')}</table></div>`;
      },
      study() {
        el.innerHTML = `<div class="grid" style="grid-template-columns:1.5fr 1fr;align-items:start" id="sg"><div class="card pad-l"><h2>Study material</h2>${L.notes.map((p) => `<p class="justify" style="font-size:1.05rem">${h(p)}</p>`).join('')}
          ${(L.teach || []).map((t) => `<h3 style="margin-top:16px">${h(t.title)}</h3><ul class="ticks">${t.points.map((x) => `<li>${h(x)}</li>`).join('')}</ul>`).join('')}</div>
          <div class="grid"><div class="card"><h3>Key words</h3><div class="btns">${L.vocab.map((v) => `<span class="chip">${h(v)}</span>`).join('')}</div></div>
          ${L.safety && L.safety.length ? `<div class="card" style="background:var(--maroon-l);border-color:#f2cad7"><h3 style="color:var(--maroon)">${icon('HardHat')} Safety rules</h3><ul class="clean">${L.safety.map((x) => `<li>${h(x)}</li>`).join('')}</ul></div>` : ''}
          ${L.steps ? `<div class="card"><h3>Steps</h3><ol class="clean">${L.steps.items.map((x) => `<li>${h(x)}</li>`).join('')}</ol></div>` : ''}${L.videos && L.videos.length ? `<div class="card"><h3>${icon('Youtube')} Videos</h3><ul class="clean">${L.videos.map((v) => `<li><a href="${h(v.url)}" target="_blank" rel="noopener">${h(v.title)}</a></li>`).join('')}</ul></div>` : ''}</div></div>`;
        if (window.innerWidth < 900) el.querySelector('#sg').style.gridTemplateColumns = '1fr';
      },
      warmup() {
        el.innerHTML = `<div class="card pad-l" style="max-width:820px"><div class="chip g">${icon('Running')} ${L.warmup.minutes} minutes</div><h2 style="margin-top:10px">${h(L.warmup.title)}</h2>
          <ol style="font-size:1.1rem;padding-left:1.2em">${L.warmup.steps.map((x) => `<li style="margin-bottom:10px">${h(x)}</li>`).join('')}</ol>
          <div style="display:flex;align-items:center;gap:16px;margin-top:10px"><div class="bigcode" id="tm" style="font-size:3rem;letter-spacing:.04em">${L.warmup.minutes}:00</div><button class="btn gold" id="ts">${icon('Play')} Start timer</button><button class="btn alt" id="tr">${icon('Redo')}</button></div></div>`;
        let left = L.warmup.minutes * 60, t = null;
        const show = () => (el.querySelector('#tm').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
        el.querySelector('#ts').onclick = (e) => { if (t) { clearInterval(t); t = null; e.currentTarget.innerHTML = icon('Play') + ' Start timer'; return; } e.currentTarget.innerHTML = icon('Pause') + ' Pause'; t = setInterval(() => { left = Math.max(0, left - 1); show(); if (!left) { clearInterval(t); t = null; toast("Time's up!"); } }, 1000); };
        el.querySelector('#tr').onclick = () => { left = L.warmup.minutes * 60; show(); };
        current = { destroy() { clearInterval(t); } };
      },
      worksheet() {
        const W = L.worksheet;
        if (!W) { el.innerHTML = `<div class="card pad-l" style="max-width:820px"><h3>Worksheet</h3><p class="muted">This worksheet was written for this lesson as a Word file. Download it to print.</p><div class="btns">${F.wsDocx ? `<a class="btn" href="files/${F.wsDocx}" download>${icon('FileWord')} Download Word</a>` : ''}${F.wsPdf ? `<a class="btn maroon" href="files/${F.wsPdf}" download>${icon('FilePdf')} Download PDF (print)</a>` : ''}</div>${F.wsPdfImg ? '' : ''}</div>`; return; }
        el.innerHTML = `<div class="btns" style="margin-bottom:14px">${F.wsDocx ? `<a class="btn" href="files/${F.wsDocx}" download>${icon('FileWord')} Download Word</a>` : ''}${F.wsPdf ? `<a class="btn maroon" href="files/${F.wsPdf}" download>${icon('FilePdf')} Download PDF (print)</a>` : ''}</div>
          <div class="doc" style="max-width:820px"><div class="small" style="color:var(--teal);font-weight:700;letter-spacing:.06em">${h(P.name.toUpperCase())}</div><h2 style="margin:4px 0 0">${h(W.title)}</h2><p style="color:var(--maroon)">${h(W.subtitle)}</p><p class="justify">${h(W.intro)}</p>
          ${W.parts.map((p) => `<h3 style="color:var(--teal);margin-top:16px">${h(p.heading)}</h3>${p.text ? `<p>${h(p.text)}</p>` : ''}${p.items ? `<ul class="clean">${p.items.map((x) => `<li>${h(x)}</li>`).join('')}</ul>` : ''}${p.cols ? `<table><tr>${p.cols.map((c) => `<th>${h(c)}</th>`).join('')}</tr>${p.rows.map((r) => `<tr>${r.map((c) => `<td>${h(c)}&nbsp;</td>`).join('')}</tr>`).join('')}</table>` : ''}${p.type === 'draw' ? '<div style="height:110px;border:1px dashed #9ab7b8;border-radius:8px"></div>' : ''}`).join('')}</div>`;
      },
      quiz() {
        el.innerHTML = `<div class="card pad-l" style="max-width:900px"><div class="section-title" style="margin-top:0"><h2>Live quiz: ${L.quiz.length} questions</h2>${isInst() ? `<button class="btn gold" id="sq2">${icon('Gamepad')} Start live quiz</button>` : ''}</div>
          <p class="muted">Students join with the quiz code, their first name, last name and class. Each question has a ${L.grade == 4 ? 25 : 20}-second timer; faster correct answers score more game points. Marks are the number of correct answers.</p>
          <ol style="padding-left:1.2em">${L.quiz.map((q) => `<li style="margin-bottom:14px"><b>${h(q.q)}</b><div class="btns" style="margin-top:6px">${q.o.map((o, i) => `<span class="chip ${isInst() && i === q.a ? 'green' : 'grey'}">${isInst() && i === q.a ? icon('Check') + ' ' : ''}${h(o)}</span>`).join('')}</div>${isInst() ? `<div class="small muted" style="margin-top:4px">${h(q.e)}</div>` : ''}</li>`).join('')}</ol>
          ${!isInst() ? '<p class="small muted">Answers are visible to instructors only.</p>' : ''}</div>`;
        const b = el.querySelector('#sq2'); if (b) b.onclick = () => startQuiz(L);
      },
    };
    views.games = () => {
      const gl = Games.forLesson(L).map(Games.byId);
      el.innerHTML = `<p class="muted">Skills games for this lesson. Keyword Jumble and Missing Letters use this lesson's key words. Practise on one screen, or start a live game with a QR code and a scoreboard.</p>
        <div class="grid g3">${gl.map((g) => `<div class="card gamecard"><div class="gi" style="background:${g.col}">${icon(g.ic)}</div><h3>${h(g.n)}</h3><p class="muted small">${h(g.d)}</p><div class="btns" style="margin-top:auto"><button class="btn alt sm" data-p="${g.id}">${icon('Play')} Practise</button>${isStaff() ? `<button class="btn gold sm" data-h="${g.id}">${icon('Users')} Start live game</button>` : ''}</div></div>`).join('')}</div><div id="gs" style="margin-top:18px"></div>`;
      el.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => { if (current && current.destroy) current.destroy(); current = Games.runGame(el.querySelector('#gs'), b.dataset.p, L); el.querySelector('#gs').scrollIntoView({ behavior: 'smooth' }); }));
      el.querySelectorAll('[data-h]').forEach((b) => (b.onclick = async () => { try { const r = await API.call('gameCreate', { token: auth.token, gameId: b.dataset.h, lessonId: L.id }); location.hash = '#/ghost/' + r.game.code; } catch (e) { toast(e.message); } }));
    };
    (views[t] || views.overview)();
  }

  // ---------- project ----------
  async function project(id) {
    drawNav('pool');
    if (!D.projects[id]) await settingsNow(true);
    const P = D.projects[id]; if (!P) { app.innerHTML = '<p>Project not found.</p>'; return; }
    const uses = [];
    Object.entries(D.grades).forEach(([g, G]) => G.plan.forEach((w) => { if (w.project === id) uses.push(Object.assign({ grade: g }, w)); }));
    const X = (D.projectExtras || {})[id] || {};
    const vids = (X.videos || []).map((v) => Object.assign({ vid: (/(?:v=|youtu\.be\/)([\w-]{11})/.exec(v.url) || [])[1] }, v)).filter((v) => v.vid);
    const photos = X.photos || [];
    app.innerHTML = `<div class="crumbs"><a href="#/pool">Project Pool</a> / ${h(P.name)}</div>
      <div class="card pad-l" style="display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;margin-bottom:18px"><div style="width:84px;height:84px;border-radius:22px;background:${pcol(id)};color:#fff;display:grid;place-items:center;font-size:40px">${icon(PICON[id] || 'Tools')}</div>
        <div><div class="meta" style="margin:0 0 6px"><span class="chip">${h(P.area)}</span><span class="chip grey">${/to/.test(P.grades) ? 'Grades' : 'Grade'} ${h(P.grades)}</span>${P.sessions ? `<span class="chip grey">${P.sessions} session${P.sessions > 1 ? 's' : ''} (2 periods each)</span>` : ''}<span class="chip ${P.source === 'framework' ? 'm' : 'g'}">${P.source === 'framework' ? 'TCD Framework' : 'TCD team project'}</span></div><h1 style="margin:0">${h(P.name)}</h1></div></div>
      <div class="grid g2" style="align-items:start">
        <div class="grid"><div class="card pad-l"><h3>About the project</h3><p class="justify">${h(P.summary)}</p>${P.outcomes ? `<h3>Learning outcomes</h3><ul class="ticks">${P.outcomes.map((x) => `<li>${h(x)}</li>`).join('')}</ul>` : ''}<p class="small muted" style="margin:10px 0 0">Framework link: ${h(P.framework || '')}${P.term ? ` | Planned for Term ${P.term}` : ''}</p></div>
          ${(D.sessionPlans || {})[id] ? `<div class="card pad-l"><h3>Lesson structure</h3><p class="small muted" style="margin-top:-4px">One session per week. Open a session for the full lesson plan, ready to print or save as PDF.</p><ol class="plan-steps">${D.sessionPlans[id].map((x, i) => `<li><a href="#/plan/${id}/${i + 1}"><b>${h(x.t)}</b></a><br><span class="small muted">${h(x.o)}</span></li>`).join('')}</ol></div>` : X.plan && X.plan.length ? `<div class="card pad-l"><h3>Project plan</h3><ol class="plan-steps">${X.plan.map((x) => `<li>${h(x)}</li>`).join('')}</ol></div>` : ''}
          ${uses.length ? `<div class="card pad-l"><h3>Lessons and timeline</h3>${uses.map((w) => `<a class="wk" href="${w.lessonId ? '#/lesson/' + w.lessonId : '#/week/' + w.grade + '/' + w.week}" style="margin-bottom:10px"><span class="dot" style="background:${pcol(id)}"></span><div class="wnum"><b>${w.week}</b><span>Grade ${w.grade}</span></div><div><h3>${h(w.title)}</h3><p class="small">${h(w.dates)}</p></div><div class="status">${w.lessonId ? `<span class="chip green">${icon('Check')} Full pack</span>` : '<span class="chip grey">Plan</span>'}</div></a>`).join('')}</div>` : ''}
          ${vids.length ? `<div class="card pad-l"><h3>${icon('Youtube')} Videos about this project</h3><div class="vgrid">${vids.map((v) => `<a class="vcard" href="${h(v.url)}" target="_blank" rel="noopener"><span class="vth" style="background-image:url('https://i.ytimg.com/vi/${v.vid}/mqdefault.jpg')"><span class="play">${icon('Play')}</span></span><b>${h(v.title)}</b></a>`).join('')}</div><p class="small muted" style="margin:10px 0 0">Watch each video in full before showing it to students.</p></div>` : ''}</div>
        <div class="grid">${photos.length ? `<div class="card" style="padding:10px"><div class="pphotos">${photos.map((p) => `<img src="${p}" alt="${h(P.name)}" loading="lazy">`).join('')}</div></div>` : ''}
          <div class="card"><h3>Tools and materials</h3><ul class="clean">${((X.tools && X.tools.length ? X.tools : P.materials) || []).map((x) => `<li>${h(x)}</li>`).join('')}</ul></div>
          <div class="card" style="background:var(--teal-ll)"><h3>Assessment (TCD Framework rubric)</h3><table class="t" style="font-size:.85rem"><tr><th>Criterion</th><th>Weight</th></tr>${Docs.CRIT.map(([, n, w]) => `<tr><td>${n}</td><td>${w}</td></tr>`).join('')}</table><p class="small muted" style="margin:8px 0 0">Levels: Emerging, Developing, Proficient, Advanced.</p></div></div>
      </div>`;
  }

  // ---------- pool ----------
  async function pool() {
    drawNav('pool');
    await settingsNow();
    let f = 'all', q = '';
    const list = Object.entries(D.projects).filter(([, p]) => p.pool !== 'none');
    app.innerHTML = `<div class="lesson-head"><div><h1>TCD Project Pool</h1><p class="muted" style="margin:0">Every project in the TCD Applied Design, Skills and Technologies Framework, plus the TCD team's own projects. Full materials for Grades 4 to 6; details for Grades 7 to 9.</p></div>${isInst() ? `<div class="btns"><button class="btn gold" id="addp">${icon('Plus')} Add a new project idea</button></div>` : ''}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:18px"><div class="seg" id="fl">${[['all', 'All'], ['full', 'Grades 4 to 6'], ['overview', 'Grades 7 to 9'], ['tcd', 'TCD team'], ['framework', 'Framework']].map(([k, n]) => `<button data-f="${k}" class="${k === f ? 'on' : ''}">${n}</button>`).join('')}</div>
      <input class="i" id="q" placeholder="Search projects" style="max-width:280px"></div><div class="grid g3" id="pl"></div>`;
    const draw = () => {
      const items = list.filter(([, p]) => (f === 'all' || p.pool === f || p.source === f) && (!q || (p.name + ' ' + p.summary + ' ' + p.area).toLowerCase().includes(q)));
      const thumb = (id) => { const X = (D.projectExtras || {})[id] || {}; if (X.photos && X.photos.length) return X.photos[0]; const v = (X.videos || []).map((x) => (/(?:v=|youtu\.be\/)([\w-]{11})/.exec(x.url) || [])[1]).find(Boolean); return v ? `https://i.ytimg.com/vi/${v}/mqdefault.jpg` : ''; };
      app.querySelector('#pl').innerHTML = items.map(([id, p]) => `<a class="card pcard" href="#/project/${id}" style="display:flex;flex-direction:column;gap:8px">${thumb(id) ? `<span class="pthumb" style="background-image:url('${thumb(id)}')"></span>` : ''}<div style="display:flex;gap:12px;align-items:center"><div style="width:46px;height:46px;border-radius:13px;background:${pcol(id)};color:#fff;display:grid;place-items:center;font-size:22px;flex:none">${icon(PICON[id] || 'Tools')}</div><div><h3 style="margin:0">${h(p.name)}</h3><span class="small muted">${h(p.area)}</span></div></div>
        <p class="small" style="margin:0;color:var(--ink-2)">${h(p.summary)}</p><div class="meta" style="margin-top:auto"><span class="chip grey">${/to/.test(p.grades) ? 'Grades' : 'Grade'} ${h(p.grades)}</span><span class="chip ${p.source === 'framework' ? 'm' : 'g'}">${p.source === 'framework' ? 'Framework' : p.custom ? 'New idea' : 'TCD team'}</span>${p.pool === 'overview' ? '<span class="chip grey">Details only</span>' : ''}</div></a>`).join('') || '<p class="muted">No projects match.</p>';
    };
    app.querySelectorAll('#fl button').forEach((b) => (b.onclick = () => { f = b.dataset.f; app.querySelectorAll('#fl button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
    app.querySelector('#q').oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); };
    const ap = app.querySelector('#addp'); if (ap) ap.onclick = () => addProjectModal(() => pool());
    draw();
  }

  // ---------- academic calendar ----------
  const DAY = 864e5;
  const ymd = (d) => d.toISOString().slice(0, 10);
  const pd = (s) => new Date(s + 'T00:00:00Z');
  const fmtD = (d, o) => d.toLocaleDateString('en-GB', Object.assign({ day: 'numeric', month: 'short', timeZone: 'UTC' }, o || {}));
  function termWeek(t, w) { const a = new Date(pd(D.calendar.terms[t].start).getTime() + (w - 1) * 7 * DAY); const b = new Date(a.getTime() + 4 * DAY); return `${fmtD(a)} to ${fmtD(b)}`; }
  const CAL_COL = { break: ['#FDE7EC', '#9E1B4B', 'Break'], holiday: ['#FFF1D6', '#9A6200', 'Holiday'], assess: ['#E6ECFA', '#2F4FA8', 'School assessments'], tcd: ['#DDF3EC', '#0B6B4F', 'TCD Skills Assessment'], pd: ['#EEE6F7', '#5B3A8A', 'Staff PD'], start: ['#DFF1F2', '#0A5C5F', 'Term dates'], info: ['#F1F3F4', '#4A5A62', 'Information'] };
  function calendar() {
    drawNav('stu'); const C = D.calendar;
    const byDay = {}; C.events.forEach((e) => { const a = pd(e.start), b = pd(e.end || e.start); for (let d = a; d <= b; d = new Date(d.getTime() + DAY)) (byDay[ymd(d)] = byDay[ymd(d)] || []).push(e); });
    const termOf = (d) => { for (const t of ['1', '2', '3']) { const T = C.terms[t]; const a = pd(T.start), b = new Date(a.getTime() + (T.weeks * 7 - 3) * DAY); if (d >= a && d <= b) return [t, Math.floor((d - a) / (7 * DAY)) + 1]; } return null; };
    const pri = ['tcd', 'assess', 'holiday', 'break', 'pd', 'start', 'info'];
    const month = (y, m) => {
      const first = new Date(Date.UTC(y, m, 1)); const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); const lead = (first.getUTCDay() + 6) % 7;
      let cells = '<div class="cal-h">Mon</div><div class="cal-h">Tue</div><div class="cal-h">Wed</div><div class="cal-h">Thu</div><div class="cal-h">Fri</div><div class="cal-h">Sat</div><div class="cal-h">Sun</div>' + '<div></div>'.repeat(lead);
      for (let i = 1; i <= n; i++) { const d = new Date(Date.UTC(y, m, i)); const ev = (byDay[ymd(d)] || []).slice().sort((a, b) => pri.indexOf(a.type) - pri.indexOf(b.type)); const wk = d.getUTCDay() === 0 || d.getUTCDay() === 6; const c = ev.length ? CAL_COL[ev[0].type] : null; const tw = termOf(d);
        cells += `<div class="cal-d${wk ? ' we' : ''}" style="${c ? `background:${c[0]};color:${c[1]};font-weight:600` : ''}" title="${h(ev.map((e) => e.label).join(' | ') || (tw && !wk ? 'Term ' + tw[0] + ', Week ' + tw[1] : ''))}">${i}</div>`; }
      return `<div class="card cal-m"><h3>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h3><div class="cal-g">${cells}</div></div>`;
    };
    const months = []; for (let k = 0; k < 12; k++) months.push(month(2026 + Math.floor((7 + k) / 12), (7 + k) % 12));
    const now = new Date(); const tw = termOf(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
    const list = C.events.filter((e) => e.type !== 'info' || /Ramadan/.test(e.label)).map((e) => { const c = CAL_COL[e.type]; return `<tr><td style="white-space:nowrap">${fmtD(pd(e.start), { weekday: 'short', year: 'numeric' })}${e.end ? ' to ' + fmtD(pd(e.end), { weekday: 'short', year: 'numeric' }) : ''}</td><td><span class="chip" style="background:${c[0]};color:${c[1]}">${c[2]}</span></td><td>${h(e.label)}</td></tr>`; }).join('');
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / Academic Calendar</div>
      <div class="lesson-head"><div><h1>${h(C.title)}</h1><p class="muted" style="margin:0">Emirates National Schools | ${tw ? `Today is in <b>Term ${tw[0]}, Week ${tw[1]}</b>` : 'Term dates, breaks and assessments'}</p></div></div>
      <div class="grid g3" style="margin-bottom:16px">${['1', '2', '3'].map((t) => { const T = C.terms[t]; const a = pd(T.start), b = new Date(a.getTime() + (T.weeks * 7 - 3) * DAY); return `<div class="card"><div class="chip m">Term ${t}</div><h3 style="margin:8px 0 4px">${fmtD(a, { year: 'numeric' })} to ${fmtD(b, { year: 'numeric' })}</h3><p class="small muted" style="margin:0">${T.weeks} weeks | ${T.days} school days</p></div>`; }).join('')}</div>
      <div class="cal-legend">${Object.values(CAL_COL).filter((c) => c[2] !== 'Information').map((c) => `<span><i style="background:${c[0]};border-color:${c[1]}"></i>${c[2]}</span>`).join('')}</div>
      <div class="cal-grid">${months.join('')}</div>
      <h2 style="margin-top:22px">Key dates</h2>
      <div class="tbl-wrap"><table class="t">${list}</table></div>
      <p class="small muted" style="margin-top:10px">${h(C.note)} Hover over or tap a date to see what is on that day.</p>`;
  }

  // ---------- custom projects and Term 2/3 plans (kept in Settings) ----------
  let SET = null;
  async function settingsNow(force) { if (SET && !force) return SET; try { SET = (await API.call('settings', {})).settings || {}; } catch (e) { SET = SET || {}; } mergePool(); return SET; }
  function customPool() { try { return JSON.parse((SET || {})['pool:custom'] || '[]'); } catch (e) { return []; } }
  function mergePool() { customPool().forEach((p) => { D.projects[p.id] = Object.assign({ source: 'tcd', pool: 'full', outcomes: [], materials: [], custom: true }, p); }); }
  async function saveSetting(key, value) { await API.call('setSetting', { token: auth.token, key, value }); SET[key] = value; }
  async function termPlanner(g, t, box) {
    box.innerHTML = '<div class="loading">Loading plan...</div>';
    await settingsNow();
    const key = `plan:t${t}:g${g}`; let plan = {}; try { plan = JSON.parse(SET[key] || '{}'); } catch (e) { }
    const C = D.calendar.terms[t]; const opts = Object.entries(D.projects).filter(([id, p]) => p.pool !== 'none' && id !== 'term1-showcase' && (id !== 'hydroponics-courtyard-farm' || String(g) === '6')).sort((a, b) => a[1].name.localeCompare(b[1].name));
    const REC = ((D.recommended || {})[t] || {})[g] || {}; if (!Object.keys(plan).length) plan = JSON.parse(JSON.stringify(REC));
    const draw = () => {
      const occ = {}; const sess = (w) => { const p = (plan[w] || {}).p; if (!p || !(D.sessionPlans || {})[p]) return ''; let k = 0; for (let x = 1; x <= w; x++) if ((plan[x] || {}).p === p) k++; return k <= D.sessionPlans[p].length ? ` <a class="small" href="#/plan/${p}/${k}${/to/.test(D.projects[p].grades) ? '?g=' + g : ''}">Lesson plan</a>` : ''; };
      box.innerHTML = `<div class="card" style="margin-bottom:14px"><p class="justify" style="margin:0">Term ${t} runs for ${C.weeks} weeks (${C.days} school days), following the ENS Academic Calendar. ${Object.keys(REC).length ? '<b>The Courtyard Hydroponics Farm is already planned for Grade 6;</b> you can change it. ' : ''}Choose a project for each week of Term ${t}. ${isInst() ? 'Pick from the Project Pool, or add a new project idea from the Project Pool page. Press Save when you finish.' : 'Only instructors can change the plan.'} Lesson packs (slides, lesson plan and worksheet) for the chosen projects are prepared by the TCD team in the standard format.</p></div>
        <div class="tbl-wrap"><table class="t"><tr><th style="width:150px">Week</th><th>Project</th><th>Note for this week</th></tr>
        ${Array.from({ length: C.weeks }, (_, i) => i + 1).map((w) => { const e = plan[w] || {}; const wd = termWeek(t, w); if (C.closed[w]) return `<tr style="background:#F4F6F7"><td><b>Week ${w}</b><br><span class="small muted">${wd}</span></td><td colspan="2" class="muted">${h(C.closed[w])}</td></tr>`; return `<tr><td><b>Week ${w}</b><br><span class="small muted">${wd}</span>${C.short[w] ? `<br><span class="small" style="color:#9E1B4B">${h(C.short[w])}</span>` : ''}</td><td>${isInst() ? `<select class="i" data-w="${w}"><option value="">Not planned yet</option><option value="break" ${e.p === 'break' ? 'selected' : ''}>Break or no lessons</option><option value="term1-showcase" ${e.p === 'term1-showcase' ? 'selected' : ''}>Skills Assessment and certificates</option>${opts.map(([id, p]) => `<option value="${id}" ${e.p === id ? 'selected' : ''}>${h(p.name)}${p.custom ? ' (new idea)' : ''}</option>`).join('')}</select>` : h(e.p === 'break' ? 'Break or no lessons' : (D.projects[e.p] || {}).name || 'Not planned yet')}${sess(w)}</td><td>${isInst() ? `<input class="i" data-n="${w}" value="${h(e.n || '')}" maxlength="120" placeholder="Optional, for example Session 2: build the prototype">` : h(e.n || '')}</td></tr>`; }).join('')}</table></div>
        ${isInst() ? `<div class="btns" style="margin-top:12px"><button class="btn gold" id="sv">${icon('Save')} Save Term ${t} plan</button>${Object.keys(REC).length ? `<button class="btn alt" id="rc">${icon('Redo')} Reset to the starting plan</button>` : ''}</div>` : ''}`;
      const rc = box.querySelector('#rc'); if (rc) rc.onclick = () => { plan = JSON.parse(JSON.stringify(REC)); draw(); toast('Starting plan filled in. Press Save to keep it.'); };
      const sv = box.querySelector('#sv'); if (sv) sv.onclick = async () => {
        const out = {}; box.querySelectorAll('[data-w]').forEach((el) => { const w = el.dataset.w; const n = box.querySelector(`[data-n="${w}"]`).value.trim(); if (el.value || n) out[w] = { p: el.value, n }; });
        try { await saveSetting(key, JSON.stringify(out)); plan = out; toast(`Term ${t} plan saved`); } catch (e) { toast(e.message); }
      };
    };
    draw();
  }
  function addProjectModal(done) {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="box"><h2>Add a new project idea</h2>
      <div class="field"><label class="f">Project name</label><input class="i" id="pn" maxlength="70" required></div>
      <div class="row2"><div class="field"><label class="f">Area</label><input class="i" id="pa" maxlength="50" placeholder="For example Robotics and Coding"></div><div class="field"><label class="f">Grades</label><input class="i" id="pg" maxlength="10" placeholder="For example 4 to 6"></div></div>
      <div class="field"><label class="f">Short summary</label><textarea class="i" id="ps" rows="3" maxlength="400"></textarea></div>
      <div class="field"><label class="f">What students learn (one per line)</label><textarea class="i" id="po" rows="3" maxlength="400"></textarea></div>
      <div class="field"><label class="f">Materials (one per line)</label><textarea class="i" id="pm" rows="3" maxlength="400"></textarea></div>
      <div class="btns"><button class="btn alt" id="c">Cancel</button><button class="btn gold" id="ok">${icon('Plus')} Add to the pool</button></div></div>`;
    document.body.appendChild(m);
    m.querySelector('#c').onclick = () => m.remove();
    m.querySelector('#ok').onclick = async () => {
      const v = (id) => m.querySelector('#' + id).value.trim(); const lines = (id) => v(id).split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 8);
      if (!v('pn')) return toast('Please type a project name.');
      const id = 'custom-' + v('pn').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Date.now().toString(36).slice(-4);
      const list = customPool(); list.push({ id, name: v('pn'), area: v('pa') || 'New project idea', grades: v('pg') || '4 to 6', summary: v('ps'), outcomes: lines('po'), materials: lines('pm'), framework: 'New project idea added by the TCD team' });
      try { await saveSetting('pool:custom', JSON.stringify(list)); mergePool(); m.remove(); toast('Project added to the pool'); done(); } catch (e) { toast(e.message); }
    };
  }

  // ---------- TCD Framework ----------
  function framework() {
    drawNav('hub'); const F = D.framework; const pl = (ids) => ids.map((x) => D.projects[x] ? `<a href="#/project/${x}">${h(D.projects[x].name)}</a>` : h(x)).join(', ');
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / TCD Framework</div>
      <div class="lesson-head"><div><h1>${h(F.title)}</h1><p class="muted" style="margin:0">${h(F.version)} | Grades 4 to 9</p></div></div>
      <div class="card pad-l" style="margin-bottom:16px">${F.intro.map((x) => `<p class="justify">${h(x)}</p>`).join('')}</div>
      <h2>Learning model: theory to workshop practice</h2>
      <div class="grid g3" style="margin-bottom:18px">${F.model.map((m) => `<div class="card"><h3 style="margin-top:0">${h(m.stage)}</h3><p class="small justify">${h(m.fn)}</p><p class="small muted justify" style="margin:0">${h(m.app)}</p></div>`).join('')}</div>
      <h2>Grade plans</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Grade</th><th>Course</th><th>Term 1</th><th>Term 2</th><th>Term 3</th></tr>
      ${F.grades.map((g) => `<tr><td><b>${h(g.g)}</b></td><td><b>${h(g.title)}</b><br><span class="small muted">${h(g.idea)}</span></td>${g.terms.map((t, i) => `<td>${h(t)}<br><span class="small">${pl([g.projects[i]])}</span></td>`).join('')}</tr>`).join('')}</table></div>
      <h2>Assessment architecture</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Domain</th><th>Weight</th><th>What teachers look for</th><th>Typical evidence</th></tr>${F.assessment.map((a) => `<tr><td><b>${h(a.domain)}</b></td><td>${a.weight}%</td><td>${h(a.look)}</td><td>${h(a.evidence)}</td></tr>`).join('')}</table></div>
      <h2>Safety levels</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Level</th><th>Student access</th><th>Typical tools</th><th>Evidence required</th></tr>${F.safety.map((a) => `<tr><td><b>${h(a.level)}</b></td><td>${h(a.access)}</td><td>${h(a.tools)}</td><td>${h(a.evidence)}</td></tr>`).join('')}</table></div>
      <h2>Workshop areas and equipment</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Equipment or zone</th><th>Use in the curriculum</th><th>Grades</th><th>Safety and supervision</th></tr>${F.zones.map((a) => `<tr><td><b>${h(a.zone)}</b></td><td>${h(a.use)}</td><td>${h(a.grades)}</td><td>${h(a.control)}</td></tr>`).join('')}</table></div>
      <h2>Curriculum links</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Area</th><th>Theory</th><th>TCD hands-on evidence</th></tr>${F.links.map((a) => `<tr><td><b>${h(a.area)}</b></td><td>${h(a.theory)}</td><td>${h(a.evidence)}</td></tr>`).join('')}</table></div>
      <h2>Portfolio evidence by grade band</h2>
      <div class="tbl-wrap" style="margin-bottom:18px"><table class="t"><tr><th>Evidence</th><th>Grades 4 to 5</th><th>Grades 6 to 7</th><th>Grades 8 to 9</th></tr>${F.evidence.map((a) => `<tr><td><b>${h(a.item)}</b></td><td>${h(a.g45)}</td><td>${h(a.g67)}</td><td>${h(a.g89)}</td></tr>`).join('')}</table></div>
      <h2>Launch project sequence</h2>
      <div class="tbl-wrap"><table class="t"><tr><th>Phase</th><th>Timing</th><th>Focus</th><th>Projects</th><th>Success evidence</th></tr>${F.launch.map((a) => `<tr><td><b>${h(a.phase)}</b></td><td>${h(a.weeks)}</td><td>${h(a.focus)}</td><td>${pl(a.projects)}</td><td>${h(a.evidence)}</td></tr>`).join('')}</table></div>`;
  }

  // ---------- printable lesson plan for a session ----------
  function planPage(pid, n) {
    drawNav('pool');
    const P = D.projects[pid], S = ((D.sessionPlans || {})[pid] || [])[+n - 1];
    if (!P || !S) { app.innerHTML = '<p>Lesson plan not found.</p>'; return; }
    const total = D.sessionPlans[pid].length;
    const gs = (String(P.grades).match(/\d+/g) || ['4']).map(Number); const grs = gs.length === 2 && /to/.test(P.grades) ? Array.from({ length: gs[1] - gs[0] + 1 }, (_, i) => String(gs[0] + i)) : gs.map(String);
    const sel = new URLSearchParams(location.hash.split('?')[1] || '').get('g'); const g = grs.includes(sel) ? sel : grs[0];
    const mins = g === '6' ? 120 : 90; const M = g === '6' ? [15, 20, 20, 50, 15] : [10, 15, 15, 40, 10];
    const objL = g === '6' ? 'Objective' : 'WALT (We Are Learning To)', scL = g === '6' ? 'Success criteria' : 'WILF (What I Am Looking For)';
    const tr = (k, v) => `<tr><th style="width:26%">${k}</th><td>${v}</td></tr>`;
    app.innerHTML = `<div class="crumbs noprint"><a href="#/project/${pid}">${h(P.name)}</a> / Session ${n} lesson plan</div>
      <div class="btns noprint" style="margin-bottom:12px">${grs.length > 1 ? `<select class="i" id="pg" style="width:auto">${grs.map((x) => `<option ${x === g ? 'selected' : ''}>${x}</option>`).join('')}</select>` : ''}<button class="btn gold" onclick="window.print()">${icon('Print')} Print or save as PDF</button>${+n > 1 ? `<a class="btn alt" href="#/plan/${pid}/${+n - 1}${grs.length > 1 ? '?g=' + g : ''}">${icon('ChevronLeft')} Session ${+n - 1}</a>` : ''}${+n < total ? `<a class="btn alt" href="#/plan/${pid}/${+n + 1}${grs.length > 1 ? '?g=' + g : ''}">Session ${+n + 1} ${icon('ChevronRight')}</a>` : ''}</div>
      <div class="card pad-l lp">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--teal);padding-bottom:8px;margin-bottom:12px"><img src="assets/img/tcd-logo-print.png" style="height:42px" alt=""><img src="assets/img/tcc-logo.png" style="height:42px" alt=""></div>
        <h1 style="margin:0 0 2px">Lesson Plan: ${h(S.t)}</h1><p class="muted" style="margin:0 0 12px">${h(P.name)} | Session ${n} of ${total}</p>
        <table class="t lpt">${tr('Teacher name', 'Ms. Lubna Kakkengal and Mr. Dilan Devendra')}${tr('Class and subject', `Grade ${g} | Technology and Career Development (TCD)`)}${tr('Duration', `${mins} minutes`)}${tr('Framework link', h(P.framework || ''))}
        ${tr(objL, h(S.o))}${tr(scL, `<ul>${S.sc.map((x) => `<li>${h(x)}</li>`).join('')}</ul>`)}${tr('Key vocabulary', h((S.v || []).join(', ')))}${tr('Resources', h((P.materials || []).join(', ')))}${S.s ? tr('Safety focus', h(S.s)) : ''}</table>
        <h2>Lesson structure</h2>
        <table class="t lpt"><tr><th style="width:18%">Stage</th><th style="width:10%">Time</th><th>Activities</th></tr>
          <tr><td><b>Starter</b></td><td>${M[0]} min</td><td>Workshop routine and safety reminder. Recap of the last session and the hook question. Share the ${g === '6' ? 'objective and success criteria' : 'WALT and WILF'}.</td></tr>
          <tr><td><b>I do</b></td><td>${M[1]} min</td><td>${h(S.i)}</td></tr>
          <tr><td><b>We do</b></td><td>${M[2]} min</td><td>${h(S.w)}</td></tr>
          <tr><td><b>You do</b></td><td>${M[3]} min</td><td>${h(S.y)}</td></tr>
          <tr><td><b>Closure</b></td><td>${M[4]} min</td><td>Students share one result and one improvement. Exit ticket or quick quiz. Clean-down checklist and tools returned.</td></tr></table>
        <h2>Differentiated learning groups</h2>
        <table class="t lpt"><tr><th>Desert Fox</th><th>Camel</th><th>Oryx</th><th>Falcon</th></tr><tr>
          <td>Extend the task, explain the theory link in their own words and support a partner.</td><td>Complete the task independently and record the evidence.</td><td>Complete the task with a partner check and a teacher check-in halfway.</td><td>Teacher or partner beside them, picture prompts and key words taught first.</td></tr></table>
        <table class="t lpt" style="margin-top:12px">${tr('Assessment evidence', h(S.ev))}${tr('TCD Framework domains', 'Design Process 25% | Technical Skills and Safety 25% | Prototype or Product Quality 20% | Theory-to-Practice Connection 15% | Communication and Reflection 15%')}${tr('Inclusive planning', 'EAL: word wall with pictures and sentence frames. SEN: step cards and extra time. G&amp;T: extension challenge and peer support.')}</table>
      </div>`;
    const pg = app.querySelector('#pg'); if (pg) pg.onchange = () => (location.hash = `#/plan/${pid}/${n}?g=${pg.value}`);
  }

  // ---------- Term 1 Skills Assessment ----------
  function assessment() {
    drawNav('hub');
    const card = (g) => { const L = D.lessons['g' + g + '-t1a']; const by = {}; L.quiz.forEach((q) => (by[q.p] = (by[q.p] || 0) + 1)); return `<div class="card pad-l"><div class="chip m">Grade ${g}</div><h2 style="margin:10px 0 6px">${L.quiz.length} questions</h2>
      <table class="lb" style="margin-bottom:12px">${L.projects.map((P) => `<tr><td>${h(P.name)}</td><td style="text-align:right">${by[P.id] || 0}</td></tr>`).join('')}</table>
      <div class="btns"><a class="btn alt" href="#/mock/${g}">${icon('Play')} Mock test (10 questions)</a>${isInst() ? `<button class="btn gold" data-g="${g}">${icon('Bolt')} Start the real assessment</button>` : ''}</div></div>`; };
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> / Term 1 Skills Assessment</div>
      <div class="lesson-head"><div><h1>Term 1 Skills Assessment</h1><p class="muted" style="margin:0">Week 13 | ${h(D.weeks[13])}</p></div>${isInst() ? `<div class="btns"><a class="btn alt" href="#/results">${icon('Certificate')} Results and certificates</a></div>` : ''}</div>
      <div class="card" style="margin-bottom:18px"><p class="justify" style="margin:0"><b>How it works.</b> First, run the mock test on the board with the whole class: open it, read each question, let the class answer, then show the right answer. Then start the real assessment. Students join with the code or QR code, type their first name, last name, grade and section, and answer the questions on their own device. Each question has its own timer (10 seconds for easy questions, 15 to 20 seconds for harder ones). Every student has one attempt. Students are ranked by score, and when scores are equal the faster student ranks higher. Every student gets a Term 1 certificate with a score for each project, and the top 3 in each class get a Certificate of Excellence.</p></div>
      <div class="grid g3">${['4', '5', '6'].map(card).join('')}</div>`;
    app.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => { const L = D.lessons['g' + b.dataset.g + '-t1a']; startQuiz(Object.assign({}, L, { title: L.title + ', Grade ' + L.grade })); }));
  }
  function mock(g) {
    drawNav('hub');
    const L = D.lessons['g' + g + '-t1a']; if (!L) { app.innerHTML = '<p>Grade not found.</p>'; return; }
    const Q = L.quiz.filter((q) => q.m); const SH = ['Star', 'Bolt', 'Leaf', 'Cube']; const pname = (id) => (L.projects.find((p) => p.id === id) || {}).name || '';
    let qi = 0, right = 0;
    const show = () => {
      Quiz.clearTimers();
      if (qi >= Q.length) {
        app.innerHTML = `<div class="game"><div class="gcard center"><div class="chip m">Mock test | Grade ${h(g)}</div><h1 style="margin:14px 0 6px">Mock test finished</h1><p class="muted">The class got ${right} of ${Q.length} right.</p><p>The real assessment has ${L.quiz.length} questions, with the same kind of questions and timers.</p><div class="btns" style="justify-content:center"><button class="btn alt" id="again">${icon('Redo')} Play again</button><a class="btn" href="#/assessment">${icon('ChevronLeft')} Back to the assessment page</a></div></div></div>`;
        app.querySelector('#again').onclick = () => { qi = 0; right = 0; show(); }; return;
      }
      const q = Q[qi], LIMIT = q.t || 15, t0 = Date.now(); let done = false;
      app.innerHTML = `<div class="crumbs"><a href="#/assessment">Term 1 Skills Assessment</a> / Grade ${h(g)} mock test</div><div class="game"><div class="gcard">
        <div class="qtop"><span class="chip">Question ${qi + 1} of ${Q.length}</span><span class="chip m">${h(pname(q.p))}</span>
        <div class="timer"><svg width="60" height="60"><circle cx="30" cy="30" r="26" stroke="#e6f2f2" stroke-width="6" fill="none"/><circle id="ring" cx="30" cy="30" r="26" stroke="#0E7C80" stroke-width="6" fill="none" stroke-dasharray="163.4" stroke-dashoffset="0" stroke-linecap="round"/></svg><b id="tl">${LIMIT}</b></div></div>
        <div class="qtext">${h(q.q)}</div>
        <div class="answers">${q.o.map((o, i) => `<button class="ans a${i}" data-i="${i}"><span class="shape">${icon(SH[i])}</span><span>${h(o)}</span></button>`).join('')}</div>
        <div id="fb"></div><div class="btns" style="justify-content:space-between;margin-top:12px"><button class="btn alt" id="rv">${icon('Eye')} Show the answer</button><button class="btn" id="nx" style="display:none">Next ${icon('ArrowRight')}</button></div></div></div>`;
      const ring = app.querySelector('#ring'), tl = app.querySelector('#tl');
      const tick = setInterval(() => { if (!document.body.contains(ring)) return clearInterval(tick); const left = Math.max(0, LIMIT - (Date.now() - t0) / 1000); tl.textContent = Math.ceil(left); ring.setAttribute('stroke-dashoffset', String(163.4 * (1 - left / LIMIT))); if (left <= 5) ring.setAttribute('stroke', '#9E1B4B'); if (left <= 0 && !done) reveal(-1); }, 100);
      function reveal(i) {
        if (done) return; done = true; clearInterval(tick); const ok = i === q.a; if (ok) right++;
        app.querySelectorAll('.ans').forEach((b) => { const bi = +b.dataset.i; b.disabled = true; if (bi === q.a) b.classList.add('right'); else if (bi === i) b.classList.add('wrong'); else b.classList.add('dim'); });
        app.querySelector('#fb').innerHTML = `<div class="feedback ${ok ? 'y' : 'n'}">${icon(ok ? 'Check' : 'Times')}<div><b>${ok ? 'Correct!' : i < 0 ? "Time's up! The right answer is shown in green." : 'Not quite. The right answer is shown in green.'}</b><br>${h(q.e)}</div></div>`;
        app.querySelector('#rv').style.display = 'none'; app.querySelector('#nx').style.display = '';
      }
      app.querySelectorAll('.ans').forEach((b) => (b.onclick = () => reveal(+b.dataset.i)));
      app.querySelector('#rv').onclick = () => reveal(-2);
      app.querySelector('#nx').onclick = () => { qi++; show(); };
    };
    show();
  }

  // ---------- instructors ----------
  function instructors() {
    drawNav('inst');
    app.innerHTML = `<h1>Our TCD Instructors</h1><p class="muted">Technology and Career Center, Emirates National Schools, Dubai</p>
      <div class="grid" style="margin-top:18px">${D.instructors.map((p) => `<div class="card pad-l prof"><div class="ph">${p.photo ? `<img src="${p.photo}" alt="${h(p.name)}">` : icon('UserTie')}</div>
        <div><h2 style="margin-bottom:2px">${h(p.name)}</h2><p class="muted">${h(p.title)}${p.email ? ` | <a href="mailto:${h(p.email)}">${icon('Envelope')} ${h(p.email)}</a>` : ''}</p>${p.bio.map((b) => `<p class="justify">${h(b)}</p>`).join('')}</div></div>`).join('')}</div>`;
  }

  // ---------- student portal ----------
  function me() {
    drawNav('me');
    const s = store.get('tcd_student') || {};
    app.innerHTML = `<div style="max-width:560px;margin:0 auto" id="mw"><div class="card pad-l"><h1>My Results</h1><p class="muted">Type your first name, last name and class exactly as you used them in the quiz.</p><div id="err"></div>
      <form id="f"><div class="row2"><div class="field"><label class="f">First name</label><input class="i" id="fn" value="${h(s.firstName || '')}" required></div><div class="field"><label class="f">Last name</label><input class="i" id="ln" value="${h(s.lastName || '')}" required></div></div>
      <label class="f">Class</label><div class="row2"><div class="field"><select class="i" id="gr" required aria-label="Grade"><option value="">Grade</option>${['4', '5', '6'].map((g) => `<option value="${g}" ${s.grade == g ? 'selected' : ''}>Grade ${g}</option>`).join('')}</select></div><div class="field"><input class="i" id="sec" value="${h(s.section || '')}" placeholder="Section, for example 6BA" aria-label="Section" required></div></div>
      <button class="btn lg" style="width:100%">Show my results</button></form></div></div>`;
    app.querySelector('#f').onsubmit = async (e) => {
      e.preventDefault(); const v = (i) => app.querySelector('#' + i).value.trim();
      try {
        const r = await API.call('myResults', { student: { firstName: v('fn'), lastName: v('ln'), grade: v('gr'), section: v('sec').toUpperCase().replace(/\s+/g, '') } });
        const st = r.student;
        app.innerHTML = `<h1>${h(st.firstName)} ${h(st.lastName)}</h1><p class="muted">Grade ${h(st.grade)} ${h(st.section)}</p>
          <div class="section-title"><h2>${icon('Certificate')} My certificates</h2></div>
          ${r.certificates.length ? `<div class="grid g3">${r.certificates.map((c, i) => `<div class="card"><div class="chip g">${c.projectId === 'TERM1' ? 'Term 1 completion' : 'Project certificate'}</div><h3 style="margin-top:10px">${h(c.projectId === 'TERM1' ? 'Term 1, ' + D.year : (D.projects[c.projectId] || {}).name)}</h3><button class="btn sm" data-c="${i}">${icon('Download')} Download PDF</button></div>`).join('')}</div>` : '<p class="muted">No certificates yet. Your instructor approves certificates at the end of each project.</p>'}
          <div class="section-title"><h2>${icon('ChartBar')} My quiz results</h2></div>
          <div class="tbl-wrap"><table class="t"><tr><th>Project</th><th>Lesson</th><th>Marks</th><th>Score</th><th>Level</th><th>Date</th><th></th></tr>${r.attempts.map((a, i) => { const L = D.lessons[a.lessonId] || {}; return `<tr><td>${h((D.projects[a.projectId] || {}).name)}</td><td>Week ${h(L.week)}: ${h(L.title)}</td><td>${a.correct}/${a.total}</td><td>${a.percent}%</td><td>${Docs.level(+a.percent)}</td><td>${new Date(a.submittedAt).toLocaleDateString('en-GB')}</td><td><button class="btn alt sm" data-a="${i}">${icon('FilePdf')} Report</button></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">No quizzes yet.</td></tr>'}</table></div>
          <p style="margin-top:18px"><a href="#/me" onclick="location.reload()">Check another student</a></p>`;
        app.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => Docs.certificate(r.certificates[+b.dataset.c], certOptions(r.certificates[+b.dataset.c], r.certSettings))));
        app.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => Docs.scoreReport(r.attempts[+b.dataset.a])));
      } catch (er) { app.querySelector('#err').innerHTML = `<div class="err">${h(er.message)}</div>`; }
    };
  }

  // ---------- certificate options (whose signatures, digital or sign by hand) ----------
  function certOptions(c, settings) {
    settings = settings || {};
    const sec = String(c.section || '').toUpperCase();
    let cfg = null;
    for (const k of [`certcfg:${c.grade}|${sec}`, `certcfg:${c.grade}|`]) { if (settings[k]) { try { cfg = JSON.parse(settings[k]); break; } catch (e) { } } }
    const sigs = {}, names = {};
    Object.keys(Docs.SIGNERS).forEach((k) => { sigs[k] = settings['sig:' + k] || ''; names[k] = settings['signame:' + k] || ''; });
    cfg = cfg || { signers: ['lubna', 'dilan'], mode: sigs.lubna || sigs.dilan ? 'digital' : 'print' };
    return Object.assign({ sigs, names }, cfg);
  }
  // Label for a signer button: instructors by name, the others by role (and name once it is added).
  function signerLabel(k, settings) {
    const S = Docs.SIGNERS[k]; const n = (settings || {})['signame:' + k] || S.name;
    return S.fixed ? n : (n ? `${n}, ${S.role}` : S.role);
  }
  function signatureToPng(file) {
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const c = document.createElement('canvas'); const sc = Math.min(1, 1600 / img.width); c.width = img.width * sc; c.height = img.height * sc;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
        const d = x.getImageData(0, 0, c.width, c.height); let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
        for (let i = 0; i < d.data.length; i += 4) { const lum = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3; const a = Math.max(0, Math.min(255, (225 - lum) * 2.2)) * d.data[i + 3] / 255; d.data[i] = 20; d.data[i + 1] = 24; d.data[i + 2] = 40; d.data[i + 3] = a; if (a > 60) { const p = i / 4, px = p % c.width, py = Math.floor(p / c.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } }
        x.putImageData(d, 0, 0); URL.revokeObjectURL(url);
        if (x1 <= x0) { rej(new Error('The picture looks empty. Please sign in dark ink on white paper.')); return; }
        const pad = 10, w = x1 - x0 + pad * 2, hh = y1 - y0 + pad * 2; const o = document.createElement('canvas'); const s2 = Math.min(1, 520 / w, 180 / hh); o.width = Math.round(w * s2); o.height = Math.round(hh * s2);
        o.getContext('2d').drawImage(c, x0 - pad, y0 - pad, w, hh, 0, 0, o.width, o.height); res(o.toDataURL('image/png'));
      };
      img.onerror = () => rej(new Error('Could not read this picture.')); img.src = url;
    });
  }
  function drawSignature() {
    return new Promise((res) => {
      const m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = `<div class="box"><h2>Draw your signature</h2><p class="muted small">Use a mouse, a stylus or your finger.</p><canvas id="pad" width="560" height="200" style="width:100%;border:1px dashed var(--line);border-radius:12px;touch-action:none;background:#fff"></canvas><div class="btns"><button class="btn alt" id="clr">Clear</button><span style="flex:1"></span><button class="btn alt" id="c">Cancel</button><button class="btn" id="ok">Use this signature</button></div></div>`;
      document.body.appendChild(m);
      const cv = m.querySelector('#pad'), x = cv.getContext('2d'); x.lineWidth = 3.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#141828'; let down = false, any = false;
      const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
      cv.onpointerdown = (e) => { down = true; any = true; cv.setPointerCapture(e.pointerId); x.beginPath(); x.moveTo(...pt(e)); };
      cv.onpointermove = (e) => { if (!down) return; x.lineTo(...pt(e)); x.stroke(); };
      cv.onpointerup = () => (down = false);
      m.querySelector('#clr').onclick = () => { x.clearRect(0, 0, cv.width, cv.height); any = false; };
      m.querySelector('#c').onclick = () => { m.remove(); res(null); };
      m.querySelector('#ok').onclick = () => { m.remove(); res(any ? cv.toDataURL('image/png') : null); };
    });
  }

  // ---------- results dashboard (instructors) ----------
  async function results() {
    drawNav('results');
    app.innerHTML = '<div class="loading">Loading results...</div>';
    let R;
    try { R = await API.call('results', { token: auth.token, filter: {} }); }
    catch (e) { if (/log in/i.test(e.message)) { auth = null; store.del('tcd_auth'); location.hash = '#/login'; return; } app.innerHTML = `<div class="err">${h(e.message)}</div>`; return; }
    const F = store.get('tcd_rf') || { grade: '', section: '', projectId: '', lessonId: '', q: '' };
    let tab = store.get('tcd_rt') || 'results';
    const sections = [...new Set(R.students.map((s) => s.section).concat(R.attempts.map((a) => a.section)).filter(Boolean))].sort();
    app.innerHTML = `<div class="lesson-head"><div><h1>Results and Reports</h1><p class="muted" style="margin:0">Quiz results, behaviour points, certificates and term report cards.${API.DEMO ? ' (Demo Mode)' : ''}</p></div><div class="btns"><button class="btn alt" id="rf">${icon('Sync')} Refresh</button></div></div>
      <div class="filters">
        <select class="i" id="fg"><option value="">All grades</option>${['4', '5', '6'].map((g) => `<option value="${g}">Grade ${g}</option>`).join('')}</select>
        <select class="i" id="fs"><option value="">All sections</option>${sections.map((s) => `<option>${h(s)}</option>`).join('')}</select>
        <select class="i" id="fp"></select><select class="i" id="fl"></select>
        <input class="i" id="fq" placeholder="Search name">
      </div>
      <div class="tabs">${[['results', 'Quiz results', 'ChartBar'], ['assess', 'Term 1 Assessment', 'Award'], ['certs', 'Certificates', 'Certificate'], ['yearend', 'Year-end certificates', 'Award'], ['cards', 'Term report cards', 'IdCard'], ['retakes', 'Second tries', 'Redo']].map(([k, n, ic]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${icon(ic)} ${n}</button>`).join('')}</div><div id="rv"></div>`;
    const $ = (s) => app.querySelector(s);
    function fillSelects() {
      const projs = []; Object.entries(D.grades).forEach(([g, G]) => { if (!F.grade || F.grade === g) G.plan.forEach((w) => { if (w.project && !projs.includes(w.project)) projs.push(w.project); }); });
      $('#fp').innerHTML = `<option value="">All projects</option>` + projs.map((p) => `<option value="${p}" ${F.projectId === p ? 'selected' : ''}>${h(D.projects[p].name)}</option>`).join('');
      const ls = Object.values(D.lessons).filter((l) => (!F.grade || l.grade == F.grade) && (!F.projectId || l.project === F.projectId));
      $('#fl').innerHTML = `<option value="">All lessons</option>` + ls.map((l) => `<option value="${l.id}" ${F.lessonId === l.id ? 'selected' : ''}>Grade ${l.grade} Week ${l.week}: ${h(l.title)}</option>`).join('');
      $('#fg').value = F.grade; $('#fs').value = F.section; $('#fq').value = F.q;
    }
    const filtered = () => R.attempts.filter((a) => (!F.grade || a.grade == F.grade) && (!F.section || a.section === F.section) && (!F.projectId || a.projectId === F.projectId) && (!F.lessonId || a.lessonId === F.lessonId) && (!F.q || (a.firstName + ' ' + a.lastName).toLowerCase().includes(F.q.toLowerCase())))
      .sort((x, y) => String(y.submittedAt).localeCompare(String(x.submittedAt)));
    const students = () => R.students.filter((s) => (!F.grade || s.grade == F.grade) && (!F.section || s.section === F.section) && (!F.q || (s.firstName + ' ' + s.lastName).toLowerCase().includes(F.q.toLowerCase()))).sort((a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName));
    const save = () => { store.set('tcd_rf', F); };
    ['fg', 'fs', 'fp', 'fl'].forEach((k) => ($('#' + k).onchange = (e) => { const m = { fg: 'grade', fs: 'section', fp: 'projectId', fl: 'lessonId' }[k]; F[m] = e.target.value; if (k === 'fg') { F.projectId = ''; F.lessonId = ''; } if (k === 'fp') F.lessonId = ''; save(); fillSelects(); draw(); }));
    $('#fq').oninput = (e) => { F.q = e.target.value; save(); draw(); };
    $('#rf').onclick = () => results();
    app.querySelectorAll('.tabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.t; store.set('tcd_rt', tab); app.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }));

    // ----- signatures shared by both certificate tabs -----
    const ST = () => R.settings || (R.settings = {});
    function sigPanel() {
      const card = (k) => { const S = Docs.SIGNERS[k]; const img = ST()['sig:' + k]; const fixed = !!S.fixed;
        return `<div class="sigcard"><b>${h(S.role)}</b>${fixed ? `<div class="small" style="margin-top:2px">${h(S.name)}</div>` : `<input class="i sm" data-nm="${k}" placeholder="Full name" value="${h(ST()['signame:' + k] || '')}" style="margin-top:6px;padding:8px 10px">`}
          <div class="sigimg">${img ? `<img src="${img}" alt="Signature">` : '<span class="muted small">No signature yet</span>'}</div>
          <div class="btns"><label class="btn alt sm">${icon('Upload')} Upload<input type="file" accept="image/*" data-up="${k}" hidden></label><button class="btn alt sm" data-draw="${k}">${icon('Edit')} Draw</button>${img ? `<button class="btn alt sm" data-rm="${k}" title="Remove">${icon('Trash')}</button>` : ''}</div></div>`; };
      return `<div><h3 style="margin-top:0">Signatures</h3><p class="small muted">Sign in dark ink on white paper and upload a photo, or draw the signature. The background is removed automatically. Names for the TCC Director and the ENS Dubai, Acting Campus Principal are saved when you leave the box.</p><div class="sigs">${Object.keys(Docs.SIGNERS).map(card).join('')}</div></div>`;
    }
    function wireSigPanel(v) {
      const saveKey = async (key, val, msg) => { try { await API.call('setSetting', { token: auth.token, key, value: val }); ST()[key] = val; toast(msg); draw(); } catch (e) { toast(e.message); } };
      v.querySelectorAll('[data-up]').forEach((inp) => (inp.onchange = async () => { const f = inp.files[0]; if (!f) return; try { saveKey('sig:' + inp.dataset.up, await signatureToPng(f), 'Signature saved'); } catch (e) { toast(e.message); } }));
      v.querySelectorAll('[data-draw]').forEach((b) => (b.onclick = async () => { const d = await drawSignature(); if (d) saveKey('sig:' + b.dataset.draw, d, 'Signature saved'); }));
      v.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => { if (confirm('Remove this signature?')) saveKey('sig:' + b.dataset.rm, '', 'Signature removed'); }));
      v.querySelectorAll('[data-nm]').forEach((inp) => (inp.onchange = () => saveKey('signame:' + inp.dataset.nm, inp.value.trim(), 'Name saved')));
    }
    function signerToggle(box, sel) {
      box.querySelectorAll('button').forEach((b) => (b.onclick = () => {
        const k = b.dataset.k;
        if (sel.signers.includes(k)) { if (sel.signers.length > 1) sel.signers = sel.signers.filter((x) => x !== k); }
        else if (sel.signers.length >= Docs.MAX_SIGNERS) { toast(`Up to ${Docs.MAX_SIGNERS} signatures fit on a certificate`); return; }
        else sel.signers = Object.keys(Docs.SIGNERS).filter((x) => sel.signers.includes(x) || x === k);
        box.querySelectorAll('button').forEach((x) => x.classList.toggle('on', sel.signers.includes(x.dataset.k)));
        if (sel.onchange) sel.onchange();
      }));
    }
    // ----- year-end certificates -----
    function yearProjects(g) {
      const base = Docs.YEAR_PROJECTS[g] || { 1: [], 2: [], 3: [] }; const out = { 1: [], 2: [], 3: [] };
      [1, 2, 3].forEach((t) => (base[t] || []).forEach(([n, sk]) => out[t].push({ term: t, name: n, skills: sk })));
      let extra = []; try { extra = JSON.parse(ST()['yearproj:' + g] || '[]'); } catch (e) { }
      extra.forEach((p) => { if (out[p.term] && !out[p.term].some((x) => x.name === p.name)) out[p.term].push(Object.assign({ added: true }, p)); });
      return out;
    }
    function parseStudents(text, grade) {
      return text.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        let p = l.split(/\t|,/).map((x) => x.trim()).filter(Boolean); let first, last, cls = '';
        if (p.length >= 3) [first, last, cls] = p;
        else { cls = p.length === 2 ? p[1] : ''; const w = p[0].split(/\s+/); first = w.shift(); last = w.join(' '); }
        return { firstName: first, lastName: last || '', grade, section: cls.toUpperCase().replace(/\s+/g, '') };
      });
    }
    function drawYearEnd(v) {
      const Y = Object.assign({ grade: F.grade || '6', title: Docs.CERT_TITLES[0], custom: '', students: '', items: [], signers: ['lubna', 'dilan'], mode: 'digital', date: new Date().toISOString().slice(0, 10) }, store.get('tcd_ye') || {});
      const keep = () => store.set('tcd_ye', Y);
      const P = yearProjects(Y.grade);
      const chosen = (n) => Y.items.some((x) => x.name === n);
      const isCustom = !Docs.CERT_TITLES.includes(Y.title);
      const studs = parseStudents(Y.students, Y.grade);
      v.innerHTML = `<p class="muted small">Make the final certificate for the whole academic year. Choose the grade, list the students, pick the projects they completed from Terms 1, 2 and 3, and choose whose signatures appear. All certificates download together as one PDF, one page per student.</p>
        <div class="grid g2" style="align-items:start">
          <div class="card"><h3 style="margin-top:0">1. Grade and certificate name</h3>
            <label class="f">Grade</label><select class="i" id="yg">${['4', '5', '6'].map((g) => `<option value="${g}" ${g === Y.grade ? 'selected' : ''}>Grade ${g}</option>`).join('')}</select>
            <label class="f" style="margin-top:12px">Certificate name</label><select class="i" id="yt">${Docs.CERT_TITLES.map((t) => `<option ${t === Y.title ? 'selected' : ''}>${h(t)}</option>`).join('')}<option value="__own" ${isCustom ? 'selected' : ''}>Type my own name</option></select>
            <input class="i" id="ytc" placeholder="For example: TCD Maker Award" value="${h(isCustom ? Y.title : '')}" style="margin-top:8px;${isCustom ? '' : 'display:none'}">
            <label class="f" style="margin-top:12px">Date of issue</label><input class="i" type="date" id="yd" value="${h(Y.date)}"></div>
          <div class="card"><h3 style="margin-top:0">2. Students</h3>
            <label class="f">One student per line: First name, Last name, Class</label>
            <textarea class="i" id="ys" rows="7" placeholder="Aisha, Al Mansoori, 6BA&#10;Omar, Saeed, 6BA">${h(Y.students)}</textarea>
            <div class="btns" style="margin-top:8px"><button class="btn alt sm" id="yfill">${icon('Users')} Add registered Grade ${h(Y.grade)} students</button><button class="btn alt sm" id="yclr">${icon('Times')} Clear</button><span class="small muted" id="ycount" style="align-self:center">${studs.length} student${studs.length === 1 ? '' : 's'}</span></div></div>
        </div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">3. Projects completed</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><select class="i" id="yp" style="flex:1;min-width:240px"><option value="">Choose a project</option>${[1, 2, 3].map((t) => `<optgroup label="Term ${t}">${P[t].length ? P[t].map((p) => `<option value="${t}|${h(p.name)}" ${chosen(p.name) ? 'disabled' : ''}>${h(p.name)}</option>`).join('') : '<option disabled>No projects added yet</option>'}</optgroup>`).join('')}</select>
            <button class="btn sm" id="yadd">${icon('Plus')} Add</button><button class="btn alt sm" id="yallt">${icon('ListOl')} Add all Term 1 projects</button></div>
          <div id="yl" style="margin-top:12px">${Y.items.length ? Y.items.map((x, i) => `<div class="sigrow" style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line)"><span class="chip g">Term ${h(x.term)}</span><div style="flex:1"><b>${h(x.name)}</b><div class="small muted">${h(x.skills)}</div></div><button class="btn alt sm" data-up1="${i}" title="Move up" ${i ? '' : 'disabled'}>${icon('ArrowUp')}</button><button class="btn alt sm" data-del="${i}" title="Remove">${icon('Times')}</button></div>`).join('') : '<p class="muted small" style="margin:0">No projects chosen yet.</p>'}</div>
          <p class="small muted" style="margin:6px 0 0">${Y.items.length}/10 projects. Up to 10 fit on one certificate.</p>
          <details style="margin-top:10px"><summary class="small" style="cursor:pointer;font-weight:600">Project not in the list? Add it</summary>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px"><select class="i" id="ynt" style="width:120px">${[1, 2, 3].map((t) => `<option value="${t}">Term ${t}</option>`).join('')}</select><input class="i" id="ynn" placeholder="Project name" style="flex:1;min-width:180px"><input class="i" id="yns" placeholder="Skills, separated by commas" style="flex:2;min-width:220px"><button class="btn sm" id="ynew">${icon('Plus')} Save</button></div>
            <p class="small muted">Saved projects stay in the Grade ${h(Y.grade)} list for everyone.${P[1].concat(P[2], P[3]).some((p) => p.added) ? ' Added so far: ' + P[1].concat(P[2], P[3]).filter((p) => p.added).map((p) => `${h(p.name)} <a href="javascript:void 0" data-rmp="${h(p.name)}">remove</a>`).join(', ') : ''}</p></details></div>
        <div class="card certset" style="margin-top:16px"><div><h3 style="margin-top:0">4. Signatures</h3>
          <label class="f">Whose signatures appear?</label><div class="seg wrapseg" id="ysg">${Object.keys(Docs.SIGNERS).map((k) => `<button type="button" data-k="${k}" class="${Y.signers.includes(k) ? 'on' : ''}">${h(signerLabel(k, R.settings))}</button>`).join('')}</div>
          <p class="small muted" style="margin:6px 0 0">Choose any of the four. With three or four, the seal moves to the top corner.</p>
          <label class="f" style="margin-top:12px;display:block">How should they be signed?</label><div class="seg" id="ym"><button type="button" data-m="digital" class="${Y.mode === 'digital' ? 'on' : ''}">Digital signature</button><button type="button" data-m="print" class="${Y.mode === 'print' ? 'on' : ''}">Blank line to sign by hand</button></div>
          <label class="f" style="margin-top:12px;display:block">Names under the signatures</label><div class="seg" id="yro"><button type="button" data-r="0" class="${Y.roleOnly ? '' : 'on'}">Name and role</button><button type="button" data-r="1" class="${Y.roleOnly ? 'on' : ''}">Role only</button></div><p class="small muted" style="margin:6px 0 0">Role only prints just "TCC Director" or "ENS Dubai, Acting Campus Principal" under their lines. Ms. Lubna and Mr. Dilan always show their names.</p><div class="btns" style="margin-top:16px"><button class="btn alt" id="yprev">${icon('Eye')} Preview the first certificate</button><button class="btn" id="ydl">${icon('Download')} Download all certificates</button></div><p class="small muted" id="yprog" style="margin:6px 0 0"></p></div>
          ${sigPanel()}</div>`;
      const q = (s) => v.querySelector(s); const redraw = () => { keep(); drawYearEnd(v); };
      q('#yg').onchange = (e) => { Y.grade = e.target.value; Y.items = []; redraw(); };
      q('#yt').onchange = (e) => { if (e.target.value === '__own') { q('#ytc').style.display = ''; q('#ytc').focus(); Y.title = q('#ytc').value || ''; } else { Y.title = e.target.value; q('#ytc').style.display = 'none'; } keep(); };
      q('#ytc').oninput = (e) => { Y.title = e.target.value; keep(); };
      q('#yd').onchange = (e) => { Y.date = e.target.value; keep(); };
      q('#ys').oninput = (e) => { Y.students = e.target.value; keep(); const n = parseStudents(Y.students, Y.grade).length; q('#ycount').textContent = `${n} student${n === 1 ? '' : 's'}`; };
      q('#yclr').onclick = () => { Y.students = ''; redraw(); };
      q('#yfill').onclick = () => { const have = new Set(parseStudents(Y.students, Y.grade).map((s) => (s.firstName + '|' + s.lastName).toLowerCase())); const add = R.students.filter((s) => String(s.grade) === Y.grade && !have.has((s.firstName + '|' + s.lastName).toLowerCase())).sort((a, b) => (a.section + a.lastName + a.firstName).localeCompare(b.section + b.lastName + b.firstName)).map((s) => `${s.firstName}, ${s.lastName}, ${s.section || ''}`); if (!add.length) { toast('No more registered students for this grade'); return; } Y.students = (Y.students.trim() ? Y.students.trim() + '\n' : '') + add.join('\n'); redraw(); };
      const addItem = (t, n) => { const p = P[t].find((x) => x.name === n); if (!p || chosen(n)) return false; if (Y.items.length >= 10) { toast('Up to 10 projects fit on one certificate'); return false; } Y.items.push({ term: +t, name: p.name, skills: p.skills }); return true; };
      q('#yadd').onclick = () => { const val = q('#yp').value; if (!val) { toast('Choose a project first'); return; } const [t, ...n] = val.split('|'); if (addItem(t, n.join('|'))) redraw(); };
      q('#yp').ondblclick = () => q('#yadd').click();
      q('#yallt').onclick = () => { P[1].forEach((p) => addItem(1, p.name)); redraw(); };
      v.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { Y.items.splice(+b.dataset.del, 1); redraw(); }));
      v.querySelectorAll('[data-up1]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up1; [Y.items[i - 1], Y.items[i]] = [Y.items[i], Y.items[i - 1]]; redraw(); }));
      const saveExtra = async (list) => { const key = 'yearproj:' + Y.grade; const val = JSON.stringify(list); try { await API.call('setSetting', { token: auth.token, key, value: val }); ST()[key] = val; redraw(); } catch (e) { toast(e.message); } };
      const extras = () => { try { return JSON.parse(ST()['yearproj:' + Y.grade] || '[]'); } catch (e) { return []; } };
      q('#ynew').onclick = () => { const name = q('#ynn').value.trim(), skills = q('#yns').value.trim(), term = +q('#ynt').value; if (!name || !skills) { toast('Add the project name and its skills'); return; } saveExtra(extras().filter((p) => p.name !== name).concat([{ term, name, skills }])).then(() => toast('Project added to the list')); };
      v.querySelectorAll('[data-rmp]').forEach((a) => (a.onclick = () => { if (confirm('Remove this project from the list?')) saveExtra(extras().filter((p) => p.name !== a.dataset.rmp)); }));
      const sel = { signers: Y.signers, mode: Y.mode, onchange: () => { Y.signers = sel.signers; keep(); } };
      signerToggle(q('#ysg'), sel);
      v.querySelectorAll('#yro button').forEach((b) => (b.onclick = () => { Y.roleOnly = b.dataset.r === '1'; keep(); v.querySelectorAll('#yro button').forEach((x) => x.classList.toggle('on', x === b)); }));
      v.querySelectorAll('#ym button').forEach((b) => (b.onclick = () => { Y.mode = b.dataset.m; keep(); v.querySelectorAll('#ym button').forEach((x) => x.classList.toggle('on', x === b)); }));
      const build = () => {
        const list = parseStudents(Y.students, Y.grade);
        if (!Y.title.trim()) { toast('Add a name for the certificate'); return null; }
        if (!list.length) { toast('Add at least one student'); return null; }
        if (!Y.items.length) { toast('Choose at least one project'); return null; }
        const iso = Y.date ? new Date(Y.date + 'T09:00:00').toISOString() : new Date().toISOString();
        return list.map((s, i) => Object.assign(s, { title: Y.title.trim(), items: Y.items.map((x) => [x.name, x.skills, x.term]), date: iso, certId: `TCD-Y2627-G${Y.grade}-${String(i + 1).padStart(3, '0')}` }));
      };
      const opts = () => Object.assign(certOptions({ grade: Y.grade }, R.settings), { signers: Y.signers, mode: Y.mode, roleOnly: !!Y.roleOnly });
      q('#yprev').onclick = async () => { const l = build(); if (l) await Docs.yearCertificates(l.slice(0, 1), opts(), `TCD_${Y.title.replace(/[^\w]+/g, '_')}_Preview.pdf`); };
      q('#ydl').onclick = async () => { const l = build(); if (!l) return; const b = q('#ydl'); b.disabled = true; try { await Docs.yearCertificates(l, opts(), `TCD_${Y.title.replace(/[^\w]+/g, '_')}_Grade${Y.grade}_2026-2027.pdf`, (d, n) => (q('#yprog').textContent = `Making certificate ${d} of ${n}...`)); q('#yprog').textContent = `Done. ${l.length} certificate${l.length === 1 ? '' : 's'} downloaded.`; } catch (e) { toast(e.message); } b.disabled = false; };
      wireSigPanel(v);
    }

    function draw() {
      const v = $('#rv');
      if (tab === 'results') {
        const list = filtered();
        const avg = list.length ? Math.round(list.reduce((s, a) => s + +a.percent, 0) / list.length) : 0;
        v.innerHTML = `<div class="grid g4" style="margin-bottom:16px"><div class="stat"><b>${list.length}</b><span>Quiz results</span></div><div class="stat"><b>${new Set(list.map((a) => a.studentId)).size}</b><span>Students</span></div><div class="stat"><b>${avg}%</b><span>Average score</span></div><div class="stat"><b>${list.filter((a) => !a.behaviour).length}</b><span>Waiting for behaviour rating</span></div></div>
          <div class="btns" style="margin-bottom:12px"><button class="btn" id="xl" ${list.length ? '' : 'disabled'}>${icon('FileExcel')} Download Excel class list</button></div>
          <div class="tbl-wrap"><table class="t"><tr><th>Student</th><th>Class</th><th>Lesson</th><th>Marks</th><th>Score</th><th>Points</th><th>Try</th><th>Behaviour and completion</th><th>Date</th><th></th></tr>
          ${list.map((a, i) => { const L = D.lessons[a.lessonId] || {}; const has = a.behaviour || a.completion; return `<tr><td><b>${h(a.firstName)} ${h(a.lastName)}</b></td><td>${h(a.grade)} ${h(a.section)}</td><td>W${h(L.week)}: ${h(L.title)}</td><td>${a.correct}/${a.total}</td><td><span class="chip ${+a.percent >= 70 ? 'green' : +a.percent >= 50 ? 'g' : 'm'}">${a.percent}%</span></td><td>${a.points}</td><td>${a.attemptNo}</td><td>${has ? `<span class="small">${h(a.behaviour || '-')} | ${h(a.completion || '-')}</span>` : '<span class="muted small">Not added</span>'} <button class="btn alt sm" data-b="${i}">${icon(has ? 'Edit' : 'Plus')}</button></td><td class="small">${new Date(a.submittedAt).toLocaleDateString('en-GB')}</td><td style="white-space:nowrap"><button class="btn alt sm" data-p="${i}" title="Score report PDF">${icon('FilePdf')}</button> ${+a.attemptNo === 1 && !R.retakes.some((r) => r.studentId === a.studentId && r.lessonId === a.lessonId) ? `<button class="btn alt sm" data-r="${i}" title="Allow a second try">${icon('Redo')}</button>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="10" class="muted">No results yet for these filters.</td></tr>'}</table></div>`;
        const xl = $('#xl'); if (xl) xl.onclick = () => Docs.classList(list, `TCD_Class_List_${F.grade ? 'Grade' + F.grade : 'All'}${F.section ? '_' + F.section : ''}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        v.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => Docs.scoreReport(list[+b.dataset.p])));
        v.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => behaviourModal(list[+b.dataset.b])));
        v.querySelectorAll('[data-r]').forEach((b) => (b.onclick = async () => { const a = list[+b.dataset.r]; if (!confirm(`Allow ${a.firstName} ${a.lastName} a second try at this quiz?`)) return; await API.call('approveRetake', { token: auth.token, studentId: a.studentId, lessonId: a.lessonId }); toast('Second try approved'); results(); }));
      }
      if (tab === 'assess') {
        const AG = store.get('tcd_ag') || { grade: F.grade || '6', section: F.section || '', p1: true, p23: false, roleOnly: false, mode: '' };
        const L = D.lessons['g' + AG.grade + '-t1a'];
        const all = R.attempts.filter((a) => a.lessonId === L.id && (!AG.section || a.section === AG.section));
        const best = {}; all.forEach((a) => { const k = a.studentId; if (!best[k] || +a.correct > +best[k].correct || (+a.correct === +best[k].correct && +a.timeTakenSec < +best[k].timeTakenSec)) best[k] = a; });
        // Rank inside each class section: higher score first, then less time.
        const rows = Object.values(best).map((a) => Object.assign({}, a, { breakdown: Docs.breakdown(L, a.answers), percent: Math.round(+a.correct * 100 / +a.total) }));
        const bySec = {}; rows.forEach((a) => (bySec[a.section] = bySec[a.section] || []).push(a));
        Object.values(bySec).forEach((list) => list.sort((x, y) => (+y.correct - +x.correct) || (+x.timeTakenSec - +y.timeTakenSec)).forEach((a, i) => (a.rank = i + 1)));
        rows.sort((x, y) => String(x.section).localeCompare(String(y.section)) || x.rank - y.rank);
        const secs = [...new Set(R.attempts.filter((a) => a.lessonId === L.id).map((a) => a.section))].sort();
        const base = certOptions({ grade: AG.grade, section: AG.section }, R.settings);
        const hasSig = Object.keys(base.sigs).some((k) => base.sigs[k]);
        const mode = AG.mode || (hasSig ? 'digital' : 'print');
        v.innerHTML = `<div class="card" style="margin-bottom:14px"><div class="filters" style="margin:0">
            <select class="i" id="ag">${['4', '5', '6'].map((g) => `<option value="${g}" ${g === AG.grade ? 'selected' : ''}>Grade ${g}</option>`).join('')}</select>
            <select class="i" id="as"><option value="">All sections</option>${secs.map((x) => `<option ${x === AG.section ? 'selected' : ''}>${h(x)}</option>`).join('')}</select></div>
          <p class="small muted" style="margin:10px 0 0">Ranking is inside each class: higher score first, and the faster student first when scores are equal. Every student gets a Term 1 Skills Certificate with a score for each project. The top 3 in each class get a Certificate of Excellence. All certificates are signed by Ms. Lubna Kakkengal and Mr. Dilan Devendra.</p></div>
          <div class="card" style="margin-bottom:14px"><h3 style="margin-top:0">Signatures on the Certificates of Excellence</h3>
            <label class="chk"><input type="checkbox" id="p1" ${AG.p1 ? 'checked' : ''}> 1st place: also signed by the ENS Dubai, Acting Campus Principal</label><br>
            <label class="chk"><input type="checkbox" id="p23" ${AG.p23 ? 'checked' : ''}> 2nd and 3rd place: also signed by the ENS Dubai, Acting Campus Principal</label><br>
            <label class="chk"><input type="checkbox" id="ro" ${AG.roleOnly ? 'checked' : ''}> Print the principal's role only, without a name</label>
            <div class="seg" style="margin-top:10px" id="md"><button data-m="digital" class="${mode === 'digital' ? 'on' : ''}" ${hasSig ? '' : 'disabled title="Upload signatures in the Certificates tab first"'}>Digital signatures</button><button data-m="print" class="${mode === 'print' ? 'on' : ''}">Blank lines to sign by hand</button></div></div>
          <div class="btns" style="margin-bottom:12px"><button class="btn gold" id="allc" ${rows.length ? '' : 'disabled'}>${icon('Download')} All certificates (PDF)</button><button class="btn" id="exc" ${rows.some((a) => a.rank <= 3) ? '' : 'disabled'}>${icon('Award')} Certificates of Excellence only</button><button class="btn alt" id="axl" ${rows.length ? '' : 'disabled'}>${icon('FileExcel')} Excel results</button><span class="small muted" id="prog"></span></div>
          <div class="tbl-wrap"><table class="t"><tr><th>Place</th><th>Student</th><th>Class</th><th>Score</th><th>Time</th>${L.projects.map((P) => `<th>${h(P.name)}</th>`).join('')}<th></th></tr>
          ${rows.map((a, i) => `<tr${a.rank <= 3 ? ' style="background:#FFF8E6"' : ''}><td><b>${a.rank}</b>${a.rank <= 3 ? ' ' + icon('Award') : ''}</td><td><b>${h(a.firstName)} ${h(a.lastName)}</b></td><td>${h(a.section)}</td><td><span class="chip ${a.percent >= 70 ? 'green' : a.percent >= 50 ? 'g' : 'm'}">${a.percent}%</span> <span class="small muted">${a.correct}/${a.total}</span></td><td>${Docs.fmtTime(a.timeTakenSec)}</td>${a.breakdown.map((p) => `<td>${p.percent}%</td>`).join('')}<td><button class="btn alt sm" data-ac="${i}" title="Certificate PDF">${icon('FilePdf')}</button></td></tr>`).join('') || `<tr><td colspan="${L.projects.length + 6}" class="muted">No Grade ${h(AG.grade)} assessment results yet.</td></tr>`}</table></div>`;
        const save = () => { store.set('tcd_ag', AG); draw(); };
        $('#ag').onchange = (e) => { AG.grade = e.target.value; AG.section = ''; save(); };
        $('#as').onchange = (e) => { AG.section = e.target.value; save(); };
        $('#p1').onchange = (e) => { AG.p1 = e.target.checked; store.set('tcd_ag', AG); };
        $('#p23').onchange = (e) => { AG.p23 = e.target.checked; store.set('tcd_ag', AG); };
        $('#ro').onchange = (e) => { AG.roleOnly = e.target.checked; store.set('tcd_ag', AG); };
        v.querySelectorAll('#md button').forEach((b) => (b.onclick = () => { AG.mode = b.dataset.m; save(); }));
        const optsFor = (c) => { const pr = c.rank === 1 ? AG.p1 : c.rank <= 3 ? AG.p23 : false; return Object.assign({}, base, { mode, roleOnly: AG.roleOnly, signers: pr ? ['lubna', 'dilan', 'principal'] : ['lubna', 'dilan'] }); };
        const certData = (a) => ({ firstName: a.firstName, lastName: a.lastName, grade: a.grade, section: a.section, rank: a.rank, percent: a.percent, breakdown: a.breakdown, certId: 'TCD-T1-' + String(a.attemptId || '').toUpperCase(), date: new Date().toISOString() });
        const run = async (list, name) => { const pg = $('#prog'); try { await Docs.assessCertificates(list.map(certData), optsFor, name, (d, n) => (pg.textContent = `Making certificate ${d} of ${n}...`)); } finally { pg.textContent = ''; } };
        const tag = `Grade${AG.grade}${AG.section ? '_' + AG.section : ''}`;
        $('#allc').onclick = () => run(rows, `TCD_Term1_Certificates_${tag}.pdf`);
        $('#exc').onclick = () => run(rows.filter((a) => a.rank <= 3), `TCD_Term1_Excellence_${tag}.pdf`);
        v.querySelectorAll('[data-ac]').forEach((b) => (b.onclick = () => { const a = rows[+b.dataset.ac]; run([a], `TCD_Term1_Certificate_${a.firstName}_${a.lastName}.pdf`.replace(/\s+/g, '_')); }));
        $('#axl').onclick = () => { const data = rows.map((a) => { const o = { Place: a.rank, 'First name': a.firstName, 'Last name': a.lastName, Grade: a.grade, Section: a.section, Marks: `${a.correct}/${a.total}`, 'Score %': a.percent, Time: Docs.fmtTime(a.timeTakenSec) }; a.breakdown.forEach((p) => (o[p.name + ' %'] = p.percent)); return o; }); const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Term 1 Assessment'); XLSX.writeFile(wb, `TCD_Term1_Assessment_${tag}.xlsx`); };
      }
      if (tab === 'certs') {
        if (!F.grade) { v.innerHTML = '<div class="card"><p class="muted" style="margin:0">Choose a grade (and a section if you like) to manage certificates.</p></div>'; return; }
        const G = D.grades[F.grade]; const projs = []; G.plan.forEach((w) => { if (w.project && w.project !== 'term1-showcase' && !projs.includes(w.project)) projs.push(w.project); });
        const sts = students();
        const cell = (s, pid) => {
          const c = R.certificates.find((x) => x.studentId === s.studentId && x.projectId === pid);
          const ql = pid === 'TERM1' ? ['g' + F.grade + '-w14'] : G.plan.filter((w) => w.project === pid && w.lessonId).map((w) => w.lessonId);
          const done = ql.filter((l) => R.attempts.some((a) => a.studentId === s.studentId && a.lessonId === l)).length;
          const label = ql.length ? `${done}/${ql.length} quizzes` : 'Attendance';
          if (c) return `<td><span class="chip green">${icon('Check')} Approved</span><br><button class="btn alt sm" data-dc="${c.certId}" style="margin-top:4px">${icon('Download')}</button> <button class="btn alt sm" data-rc="${c.certId}" title="Withdraw">${icon('Times')}</button></td>`;
          return `<td><span class="small ${ql.length && done === ql.length ? '' : 'muted'}">${label}</span><br><button class="btn ${ql.length && done === ql.length ? '' : 'alt'} sm" data-ap="${sts.indexOf(s)}" data-pid="${pid}" style="margin-top:4px">Approve</button></td>`;
        };
        const ckey = `certcfg:${F.grade}|${(F.section || '').toUpperCase()}`;
        const cur = certOptions({ grade: F.grade, section: F.section }, R.settings);
        const panel = `<div class="card certset"><div><h3 style="margin-top:0">${icon('Certificate')} Certificate settings for Grade ${h(F.grade)}${F.section ? ' ' + h(F.section) : ' (all sections)'}</h3>
          <label class="f">Whose signatures appear on the certificates?</label><div class="seg wrapseg" id="sgn">${Object.keys(Docs.SIGNERS).map((k) => `<button type="button" data-k="${k}" class="${cur.signers.includes(k) ? 'on' : ''}">${h(signerLabel(k, R.settings))}</button>`).join('')}</div>
          <label class="f" style="margin-top:12px;display:block">How should they be signed?</label><div class="seg" id="mode"><button type="button" data-m="digital" class="${cur.mode === 'digital' ? 'on' : ''}">Digital signature</button><button type="button" data-m="print" class="${cur.mode === 'print' ? 'on' : ''}">Blank line to sign by hand</button></div>
<label class="f" style="margin-top:12px;display:block">Names under the signatures</label><div class="seg" id="cro"><button type="button" data-r="0" class="${cur.roleOnly ? '' : 'on'}">Name and role</button><button type="button" data-r="1" class="${cur.roleOnly ? 'on' : ''}">Role only</button></div><p class="small muted" style="margin:6px 0 0">Role only prints just "TCC Director" or "ENS Dubai, Acting Campus Principal" under their lines. Ms. Lubna and Mr. Dilan always show their names.</p>
          <div class="btns"><button class="btn sm" id="savecfg">${icon('Check')} Save settings</button><button class="btn alt sm" id="prevcert">${icon('Eye')} Preview a certificate</button></div>
          <p class="small muted" style="margin:6px 0 0">Choose a section in the filters above to set it for one class only. Students' downloads follow these settings.</p></div>
          ${sigPanel()}</div>`;
        v.innerHTML = panel + `<p class="muted small">A certificate becomes available to the student once you approve it. Green Approve buttons mean the student completed every quiz in that project on the website. You can still approve based on attendance.</p>
          <div class="tbl-wrap"><table class="t"><tr><th>Student</th>${projs.map((p) => `<th>${h(D.projects[p].name)}</th>`).join('')}<th>Term 1 completion</th></tr>
          ${sts.map((s) => `<tr><td style="min-width:150px"><b>${h(s.firstName)} ${h(s.lastName)}</b><br><span class="small muted">Grade ${h(s.grade)} ${h(s.section)}</span></td>${projs.map((p) => cell(s, p)).join('')}${cell(s, 'TERM1')}</tr>`).join('') || `<tr><td colspan="${projs.length + 2}" class="muted">No students registered for this grade yet. Students register when they first join a quiz.</td></tr>`}</table></div>`;
        const sel = { signers: cur.signers.slice(), mode: cur.mode, roleOnly: !!cur.roleOnly };
        v.querySelectorAll('#cro button').forEach((b) => (b.onclick = () => { sel.roleOnly = b.dataset.r === '1'; v.querySelectorAll('#cro button').forEach((x) => x.classList.toggle('on', x === b)); }));
        signerToggle(v.querySelector('#sgn'), sel);
        v.querySelectorAll('#mode button').forEach((b) => (b.onclick = () => { sel.mode = b.dataset.m; v.querySelectorAll('#mode button').forEach((x) => x.classList.toggle('on', x === b)); }));
        v.querySelector('#savecfg').onclick = async () => { try { await API.call('setSetting', { token: auth.token, key: ckey, value: JSON.stringify(sel) }); R.settings = R.settings || {}; R.settings[ckey] = JSON.stringify(sel); toast('Certificate settings saved'); } catch (e) { toast(e.message); } };
        v.querySelector('#prevcert').onclick = () => { const s0 = sts[0] || { firstName: 'Student', lastName: 'Name', grade: F.grade, section: F.section || '' }; Docs.certificate({ certId: 'PREVIEW', firstName: s0.firstName, lastName: s0.lastName, grade: F.grade, section: s0.section || F.section, projectId: 'TERM1', approvedAt: new Date().toISOString() }, Object.assign(certOptions({ grade: F.grade, section: F.section }, R.settings), sel)); };
        wireSigPanel(v);
        v.querySelectorAll('[data-ap]').forEach((b) => (b.onclick = async () => { const sid = sts[+b.dataset.ap].studentId, pid = b.dataset.pid; b.disabled = true; try { await API.call('approveCertificate', { token: auth.token, studentId: sid, projectId: pid }); toast('Certificate approved'); results(); } catch (e) { toast(e.message); b.disabled = false; } }));
        v.querySelectorAll('[data-dc]').forEach((b) => (b.onclick = () => { const c = R.certificates.find((x) => x.certId === b.dataset.dc); Docs.certificate(c, certOptions(c, R.settings)); }));
        v.querySelectorAll('[data-rc]').forEach((b) => (b.onclick = async () => { if (!confirm('Withdraw this certificate?')) return; await API.call('revokeCertificate', { token: auth.token, certId: b.dataset.rc }); results(); }));
      }
      if (tab === 'yearend') { drawYearEnd(v); return; }
      if (tab === 'cards') {
        if (!F.grade) { v.innerHTML = '<div class="card"><p class="muted" style="margin:0">Choose a grade to prepare Term 1 report cards.</p></div>'; return; }
        const sts = students();
        v.innerHTML = `<p class="muted small">Each report card shows project averages, quizzes completed, behaviour rating, project completion, certificates, the optional framework rubric and your comment. Add rubric levels and a comment first, then download.</p>
          <div class="tbl-wrap"><table class="t"><tr><th>Student</th><th>Quizzes</th><th>Average</th><th>Rubric and comment</th><th></th></tr>${sts.map((s, i) => { const at = R.attempts.filter((a) => a.studentId === s.studentId); const avg = at.length ? Math.round(at.reduce((x, a) => x + +a.percent, 0) / at.length) + '%' : '-'; const rb = R.rubrics.filter((r) => r.studentId === s.studentId); return `<tr><td><b>${h(s.firstName)} ${h(s.lastName)}</b><br><span class="small muted">Grade ${h(s.grade)} ${h(s.section)}</span></td><td>${at.length}</td><td>${avg}</td><td>${rb.length ? `<span class="chip green">${rb.length} saved</span>` : '<span class="muted small">None yet</span>'} <button class="btn alt sm" data-rb="${i}">${icon('Edit')} Edit</button></td><td><button class="btn sm" data-rc="${i}">${icon('FilePdf')} Report card</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">No students registered for this grade yet.</td></tr>'}</table></div>`;
        v.querySelectorAll('[data-rb]').forEach((b) => (b.onclick = () => rubricModal(sts[+b.dataset.rb])));
        v.querySelectorAll('[data-rc]').forEach((b) => (b.onclick = () => { const s = sts[+b.dataset.rc]; Docs.reportCard(s, R.attempts.filter((a) => a.studentId === s.studentId), R.rubrics.filter((r) => r.studentId === s.studentId), R.certificates.filter((c) => c.studentId === s.studentId), D.grades[s.grade || F.grade]); }));
      }
      if (tab === 'retakes') {
        v.innerHTML = `<p class="muted small">Approve a second try from the Quiz results tab (the ${icon('Redo')} button). Each student can play a quiz at most twice.</p><div class="tbl-wrap"><table class="t"><tr><th>Student</th><th>Lesson</th><th>Approved by</th><th>Approved</th><th>Used</th></tr>${R.retakes.slice().reverse().map((r) => { const L = D.lessons[r.lessonId] || {}; return `<tr><td>${h((R.students.find((x) => x.studentId === r.studentId) || { firstName: r.studentId, lastName: '' }).firstName + ' ' + ((R.students.find((x) => x.studentId === r.studentId) || {}).lastName || ''))}</td><td>Grade ${h(L.grade)} Week ${h(L.week)}: ${h(L.title)}</td><td>${h(r.approvedBy)}</td><td>${new Date(r.approvedAt).toLocaleString('en-GB')}</td><td>${r.used ? 'Yes' : 'Not yet'}</td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">No second tries approved.</td></tr>'}</table></div>`;
      }
    }

    function behaviourModal(a) {
      const m = document.createElement('div'); m.className = 'modal';
      const pick = (name, opts, cur) => `<div class="seg wrapseg" data-g="${name}">${opts.map((o) => `<button type="button" data-v="${o}" class="${o === cur ? 'on' : ''}">${o}</button>`).join('')}</div>`;
      m.innerHTML = `<div class="box"><h2>Behaviour and project completion</h2><p class="muted">${h(a.firstName)} ${h(a.lastName)} | Week ${h((D.lessons[a.lessonId] || {}).week)}: ${h((D.lessons[a.lessonId] || {}).title)}</p>
        <label class="f">Overall class behaviour</label>${pick('behaviour', Docs.BEHAVIOUR, a.behaviour)}
        <label class="f" style="margin-top:14px;display:block">Project completion</label>${pick('completion', Docs.COMPLETION, a.completion)}
        <div class="field" style="margin-top:14px"><label class="f">Note (optional)</label><textarea class="i" id="nt" rows="2">${h(a.behaviourNote || '')}</textarea></div>
        <div class="btns"><button class="btn alt" id="c">Cancel</button><button class="btn" id="ok">Save</button></div></div>`;
      document.body.appendChild(m);
      const val = { behaviour: a.behaviour || '', completion: a.completion || '' };
      m.querySelectorAll('[data-g]').forEach((g) => g.querySelectorAll('button').forEach((b) => (b.onclick = () => { val[g.dataset.g] = b.dataset.v; g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); })));
      m.querySelector('#c').onclick = () => m.remove();
      m.querySelector('#ok').onclick = async () => { try { await API.call('behaviour', { token: auth.token, attemptId: a.attemptId, behaviour: Object.assign({ note: m.querySelector('#nt').value }, val) }); m.remove(); toast('Saved'); results(); } catch (e) { toast(e.message); } };
    }

    function rubricModal(s) {
      const G = D.grades[s.grade || F.grade]; const projs = []; G.plan.forEach((w) => { if (w.project && w.project !== 'term1-showcase' && !projs.includes(w.project)) projs.push(w.project); });
      const LV = ['', 'Emerging', 'Developing', 'Proficient', 'Advanced'];
      const get = (pid) => R.rubrics.find((r) => r.studentId === s.studentId && r.projectId === pid) || {};
      const m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = `<div class="box" style="max-width:860px"><h2>Rubric and comment</h2><p class="muted">${h(s.firstName)} ${h(s.lastName)} | Grade ${h(s.grade)} ${h(s.section)}. The rubric is optional.</p>
        <div class="tbl-wrap"><table class="t"><tr><th>Project</th>${Docs.CRIT.map(([, n, w]) => `<th title="${n}">${n.split(' ')[0]} (${w})</th>`).join('')}</tr>${projs.map((p) => `<tr><td><b>${h(D.projects[p].name)}</b></td>${Docs.CRIT.map(([k]) => `<td><select class="i" style="padding:6px" data-p="${p}" data-c="${k}">${LV.map((l) => `<option ${get(p)[k] === l ? 'selected' : ''} value="${l}">${l || '-'}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</table></div>
        <div class="field" style="margin-top:14px"><label class="f">Instructor comment for the Term 1 report card</label><textarea class="i" id="cm" rows="4">${h(get('TERM1').comment || '')}</textarea></div>
        <div class="btns"><button class="btn alt" id="c">Cancel</button><button class="btn" id="ok">Save</button></div></div>`;
      document.body.appendChild(m);
      m.querySelector('#c').onclick = () => m.remove();
      m.querySelector('#ok').onclick = async () => {
        const btn = m.querySelector('#ok'); btn.disabled = true;
        try {
          for (const p of projs) { const r = {}; m.querySelectorAll(`select[data-p="${p}"]`).forEach((x) => (r[x.dataset.c] = x.value)); if (Object.values(r).some(Boolean) || get(p).c1 !== undefined) await API.call('rubric', { token: auth.token, studentId: s.studentId, projectId: p, term: 1, rubric: r }); }
          await API.call('rubric', { token: auth.token, studentId: s.studentId, projectId: 'TERM1', term: 1, rubric: { comment: m.querySelector('#cm').value } });
          m.remove(); toast('Saved'); results();
        } catch (e) { toast(e.message); btn.disabled = false; }
      };
    }
    fillSelects(); draw();
  }

  route();
})();
