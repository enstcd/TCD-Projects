/* PDF score reports, certificates and term report cards (html2canvas + jsPDF), and Excel class lists (SheetJS). */
(function () {
  const D = window.TCD;
  const YEAR = D.year;
  const BEHAVIOUR = ['Excellent', 'Good', 'Satisfactory', 'Needs improvement'];
  const COMPLETION = ['Completed', 'In progress', 'Not completed'];
  const BCOL = { Excellent: '#2E8B57', Good: '#0E7C80', Satisfactory: '#C2671B', 'Needs improvement': '#9E1B4B', Completed: '#2E8B57', 'In progress': '#C2671B', 'Not completed': '#9E1B4B' };
  const cls = (o) => 'Grade ' + (o.grade || '') + (o.section ? ' ' + o.section : '');
  const CRIT = [['c1', 'Design Process and User Understanding', '25%'], ['c2', 'Technical Skills, Tool Choice and Safety', '25%'], ['c3', 'Prototype / Product Quality and Testing', '20%'], ['c4', 'Theory-to-Practice Connection', '15%'], ['c5', 'Communication, Collaboration and Reflection', '15%']];
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (iso) => { const d = iso ? new Date(iso) : new Date(); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  function level(p) { return p >= 85 ? 'Advanced' : p >= 70 ? 'Proficient' : p >= 50 ? 'Developing' : 'Emerging'; }
  const pill = (v) => v ? `<div style="display:inline-block;height:30px;line-height:30px;padding:0 16px;border-radius:15px;background:${BCOL[v] || '#0E7C80'};color:#fff;font:600 14px/30px Outfit,Arial">${e(v)}</div>` : '<span style="color:#9AA8AE">To be added by the instructor</span>';
  const cursive = () => `<div style="display:flex;gap:60px;margin-top:4px">${['Ms. Lubna Kakkengal', 'Mr. Dilan Devendra'].map((n) => `<div style="flex:1;text-align:center"><div style="font:400 34px/56px 'Great Vibes',cursive;color:#0A5C5F;height:56px">${n}</div><div style="font-size:12px;color:#6B7A84;margin-top:6px">TCD Instructor</div></div>`).join('')}</div>`;

  const BASE = `font-family:'Source Sans 3',Arial,sans-serif;color:#1d2830;background:#fff;box-sizing:border-box;`;

  async function toPdf(html, w, h, filename, orientation) {
    const host = document.getElementById('render');
    host.innerHTML = `<div id="pg" style="${BASE}width:${w}px;min-height:${h}px;position:relative;overflow:hidden;display:flex;flex-direction:column">${html}</div>`;
    const pg = host.querySelector('#pg');
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    await Promise.all([...pg.querySelectorAll('img')].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
    const canvas = await html2canvas(pg, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const pdf = new jspdf.jsPDF({ orientation, unit: 'pt', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    let pagePx = Math.round(canvas.width * ph / pw);
    if (canvas.height <= pagePx * 1.04) pagePx = canvas.height;
    for (let y = 0, n = 0; y < canvas.height - 4; y += pagePx, n++) {
      const c = document.createElement('canvas'); c.width = canvas.width; c.height = pagePx;
      const cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
      cx.drawImage(canvas, 0, y, canvas.width, Math.min(pagePx, canvas.height - y), 0, 0, canvas.width, Math.min(pagePx, canvas.height - y));
      if (n) pdf.addPage();
      pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ph);
    }
    pdf.save(filename);
    host.innerHTML = '';
  }

  const header = (title, sub) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:28px 48px 14px;border-bottom:3px solid #0E7C80">
      <img src="assets/img/tcd-logo-print.png" style="height:58px">
      <img src="assets/img/tcc-logo.png" style="height:50px">
    </div>
    <div style="padding:16px 48px 4px">
      <div style="font:700 11px Outfit,Arial;letter-spacing:.16em;color:#9E1B4B;text-transform:uppercase">${e(sub)}</div>
      <div style="font:700 30px Outfit,Arial;color:#0A5C5F;margin-top:4px">${e(title)}</div>
    </div>`;
  const footer = () => `<div style="margin:auto 48px 26px;border-top:1px solid #DDE6E8;padding-top:10px;display:flex;justify-content:space-between;font-size:11px;color:#6B7A84"><span>Emirates National Schools, Dubai | Technology and Career Center (TCD)</span><span>${e(YEAR)}</span></div>`;
  const box = (k, v) => `<div style="border:1px solid #DDE6E8;border-radius:10px;padding:10px 14px"><div style="font:600 10px Outfit,Arial;letter-spacing:.08em;text-transform:uppercase;color:#6B7A84">${e(k)}</div><div style="font:600 16px Outfit,Arial;margin-top:2px">${e(v)}</div></div>`;
  const sigs = () => `<div style="display:flex;gap:60px;margin-top:8px">${['Ms. Lubna Kakkengal', 'Mr. Dilan Devendra'].map((n) => `<div style="flex:1"><div style="height:38px;border-bottom:1px solid #1d2830"></div><div style="font:600 14px Outfit,Arial;margin-top:6px">${n}</div><div style="font-size:12px;color:#6B7A84">TCD Instructor</div></div>`).join('')}</div>`;

  // ---------- Quiz score report ----------
  async function scoreReport(a) {
    const L = D.lessons[a.lessonId] || {}; const P = D.projects[a.projectId] || {};
    const pct = +a.percent || Math.round((a.correct / a.total) * 100);
    const html = `${header('Quiz Score Report', 'TCD Live Quiz | ' + (P.name || ''))}
      <div style="padding:10px 48px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:12px">
        ${box('Student name', a.firstName + ' ' + a.lastName)}${box('Class', cls(a))}${box('Attempt', a.attemptNo || 1)}
      </div>
      <div style="padding:6px 48px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:12px">
        ${box('Project', P.name || a.projectId)}${box('Lesson', 'Week ' + (L.week || a.week || '') + ': ' + (L.title || ''))}${box('Date', fmtDate(a.submittedAt))}
      </div>
      <div style="margin:18px 48px;border-radius:16px;background:#0E7C80;color:#fff;display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;padding:22px 10px">
        <div><div style="font:800 46px Outfit,Arial">${a.correct}/${a.total}</div><div style="font-size:13px;opacity:.85">Marks</div></div>
        <div style="border-left:1px solid rgba(255,255,255,.3);border-right:1px solid rgba(255,255,255,.3)"><div style="font:800 46px Outfit,Arial">${pct}%</div><div style="font-size:13px;opacity:.85">Score</div></div>
        <div><div style="font:800 30px Outfit,Arial;margin-top:8px;color:#FFD27A">${level(pct)}</div><div style="font-size:13px;opacity:.85;margin-top:4px">Level | ${a.points || 0} game points | Attempt ${a.attemptNo || 1}</div></div>
      </div>
      <div style="padding:4px 48px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="border:1px solid #DDE6E8;border-radius:12px;padding:14px 16px"><div style="font:700 15px Outfit,Arial;color:#0A5C5F;margin-bottom:8px">Overall class behaviour</div>${pill(a.behaviour)}<div style="font-size:11px;color:#6B7A84;margin-top:8px">Excellent | Good | Satisfactory | Needs improvement</div></div>
          <div style="border:1px solid #DDE6E8;border-radius:12px;padding:14px 16px"><div style="font:700 15px Outfit,Arial;color:#0A5C5F;margin-bottom:8px">Project completion</div>${pill(a.completion)}<div style="font-size:11px;color:#6B7A84;margin-top:8px">Completed | In progress | Not completed</div></div>
        </div>
        ${a.behaviourNote ? `<div style="margin-top:12px;border:1px solid #DDE6E8;border-radius:10px;padding:10px 14px"><div style="font:600 10px Outfit,Arial;letter-spacing:.08em;text-transform:uppercase;color:#6B7A84">Instructor note</div><div style="font-size:14px;margin-top:4px">${e(a.behaviourNote)}</div></div>` : ''}
      </div>
      <div style="padding:26px 48px 0">${cursive()}</div>
      <div style="padding:16px 48px 14px;font-size:11px;color:#6B7A84">Levels: Advanced 85% and above | Proficient 70% to 84% | Developing 50% to 69% | Emerging below 50%. Levels follow the TCD Applied Design, Skills and Technologies Framework.</div>
      ${footer()}`;
    await toPdf(html, 794, 1123, `TCD_Score_Report_${a.firstName}_${a.lastName}_${(L.week ? 'Week' + L.week : a.lessonId)}.pdf`.replace(/\s+/g, '_'), 'portrait');
  }

  // ---------- Certificate ----------
  // One green colour family for every certificate.
  const GR = { dark: '#0B5D4F', mid: '#14806B', soft: '#9CCFC0', faint: '#D5EAE3', text: '#1d2830', grey: '#4A5A61', muted: '#6B7A84' };
  const SIGNERS = {
    lubna: { name: 'Ms. Lubna Kakkengal', role: 'TCD Instructor', fixed: true },
    dilan: { name: 'Mr. Dilan Devendra', role: 'TCD Instructor', fixed: true },
    director: { name: '', role: 'TCC Director' },
    principal: { name: '', role: 'ENS Dubai, Acting Campus Principal' },
  };
  const INSTRUCTORS = { lubna: SIGNERS.lubna.name, dilan: SIGNERS.dilan.name };
  const MAX_SIGNERS = 4;
  const CERT_SKILLS = {
    'safety-induction': ['Workshop safety', 'Following instructions', 'Careful making'],
    'junior-innovator': ['Creative ideas', 'Sketching and planning', '3D design basics', '3D printing'],
    'junior-engineer': ['Innovation and creative ideas', 'Sketching and planning', 'Prototyping', '3D design and 3D printing'],
    'junior-designer': ['3D modelling in Tinkercad', 'Accurate measurement', '3D printing'],
    'shadow-candle-holder': ['Design from a UAE theme', 'Measuring and marking out', 'Cutting and sanding with Cool Tools', 'Assembly and finishing'],
    'flowlab-game-studio': ['2D game development', 'Block coding', 'Designing game levels'],
    'candle-making': ['Following a step-by-step process', 'Hot wax safety', 'Science of melting and cooling'],
    'soap-making': ['Following a process', 'Costing and pricing', 'Product branding'],
    'photon-eco-mission': ['Coding a robot', 'Algorithms and flowcharts', 'Sustainability campaign'],
    'photon-ai-mission': ['Sensors and algorithms', 'Loops and conditions', 'Debugging'],
    'matatalab-pro': ['Sequencing commands', 'Debugging code'],
    'kubo-coding': ['Building code with TagTiles', 'Route planning', 'Record and play functions'],
    'campus-tag': ['Marking out with a stencil', 'Sanding and drilling safely', 'Finishing a product'],
    'hydroponics-courtyard-farm': ['Smart farming', 'Woodwork', '3D design and printing', 'Data recording'],
    'laser-metal-studio': ['3D design', 'Laser cutting', 'Metal stamping'],
  };
  // Term 1 certificate: every project the grade did, with the skills from each.
  const TERM_PROJECTS = {
    4: [['TCD Safety Induction and Origami', 'Workshop safety, following instructions, origami folding'], ['Junior Innovator Challenge', 'Creative ideas and presenting, sketching and planning, teamwork, 3D design basics in Tinkercad'], ['Candle Making', 'Following a step-by-step process, hot wax safety, science of melting and cooling'], ['Matatalab Pro Coding', 'Sequencing commands, debugging code'], ['KUBO Coding Robot', 'Building code with TagTiles, route planning, record and play functions']],
    5: [['TCD Safety Induction and Origami', 'Workshop safety, following instructions, origami folding'], ['Photon Environmental Mission', 'Robot sensors, algorithms and flowcharts, research and design brief, environmental campaign design'], ['Candle Making', 'Following a step-by-step process, hot wax safety, science of melting and cooling'], ['Junior Designer Challenge', '3D modelling in Tinkercad, accurate measurement, 3D printing'], ['Craft Your Campus Tag', 'Marking out with a stencil, sanding and drilling safely, finishing a product']],
    6: [['TCD Safety Induction and Origami', 'Workshop safety, following instructions, origami folding'], ['Junior Engineer Challenge', 'Idea pitching, team roles and collaboration, prototyping and testing, 3D design and 3D printing'], ['Candle Making', 'Following a step-by-step process, hot wax safety, science of melting and cooling'], ['UAE-Themed Shadow Candle Holder', 'Design from a UAE theme, measuring and marking out, cutting and sanding with Cool Tools, assembly and finishing']],
  };

  // Projects for the year-end certificate, by term. Terms 2 and 3 follow the TCD Project Briefing and can be added to on the website.
  const YEAR_PROJECTS = {
    4: { 1: TERM_PROJECTS[4], 2: [['Soap Product and Brand Identity', 'Following a process, measuring ingredients, product branding and packaging'], ['VinciBot Coding Challenge', 'Block coding, robot movement and sensors, problem solving'], ['Jewellery Making with Beads and Copper Wire', 'Pattern design, wire shaping, careful hand skills']], 3: [] },
    5: { 1: TERM_PROJECTS[5], 2: [['Candle Brand Enterprise', 'Product planning, costing and pricing, brand design'], ['fischertechnik Solar Energy', 'Building models, solar energy, simple circuits']], 3: [] },
    6: { 1: TERM_PROJECTS[6], 2: [['TCD Courtyard Hydroponics Farm', 'Smart farming, woodwork, 3D design and printing, laser engraving, data recording'], ['Soap Brand Enterprise', 'Product planning, costing and pricing, brand and packaging design'], ['Electrical Kit Challenge', 'Simple circuits, components, testing and fault finding']], 3: [['Smart Hydroponics Farm Challenge', 'Raspberry Pi and Python coding, sensors, smart farming']] },
  };
  const CERT_TITLES = ['TCD Skills Certificate', 'Certificate of Achievement', 'Certificate of Completion', 'Future Skills Award', 'Certificate of Excellence'];
  const TERM_SKILLS = { 4: [], 5: [], 6: [] };
  function classLabel(c) { const sec = String(c.section || ''); return sec && sec.startsWith(String(c.grade)) ? `Grade ${e(c.grade)}, Class ${e(sec)}` : `Grade ${e(c.grade)}${sec ? ', Section ' + e(sec) : ''}`; }
  function certSkills(c) {
    if (c.projectId === 'TERM1') return TERM_SKILLS[c.grade] || TERM_SKILLS[6];
    const P = D.projects[c.projectId] || {};
    return CERT_SKILLS[c.projectId] || (P.outcomes || []).slice(0, 3);
  }
  const label = (t) => `<div style="font:600 13px Outfit,Arial;letter-spacing:.42em;color:${GR.mid};text-transform:uppercase">${e(t)}</div><div style="width:70px;height:2px;background:${GR.mid};margin:12px auto 0"></div>`;
  function projectMiddle(c, what, skills) {
    return `      <div style="position:absolute;left:0;right:0;top:172px;text-align:center">
        ${label('Certificate of Achievement')}
        <div style="font-size:16px;color:${GR.grey};margin-top:22px;letter-spacing:.02em">This certificate is proudly presented to</div>
        <div style="font:700 54px Outfit,Arial;line-height:70px;height:70px;padding-bottom:10px;color:${GR.dark};margin-top:8px">${e(c.firstName)} ${e(c.lastName)}</div>
        <div style="width:460px;height:1px;background:${GR.soft};margin:16px auto 16px"></div>
        <div style="font-size:18px;line-height:1.55;color:${GR.text};max-width:760px;margin:0 auto">for successfully completing ${what}</div>
        <div style="font-size:15px;color:${GR.grey};margin-top:4px">${classLabel(c)} &nbsp;|&nbsp; Term 1 &nbsp;|&nbsp; Academic Year 2026-2027</div>
        <div style="margin-top:22px;font:600 11px Outfit,Arial;letter-spacing:.28em;color:${GR.muted}">SKILLS ACHIEVED</div>
        <div style="margin-top:8px;font:500 15px Outfit,Arial;color:${GR.dark}">${skills.map(e).join(`<span style="color:${GR.soft};margin:0 12px">&#9670;</span>`)}</div>
      </div>`;
  }
  const badge = (n) => `<svg width="22" height="22" viewBox="0 0 22 22" style="flex:none;margin-top:1px"><circle cx="11" cy="11" r="11" fill="${GR.mid}"/><text x="11" y="15" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#fff">${n}</text></svg>`;
  // items: [[project name, skills, optional term number]]
  function itemGrid(items, compact) {
    const cols = items.length > 8 ? 3 : 2;
    const fs = compact ? [12.5, 11] : [13.5, 12.5];
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);column-gap:${cols === 3 ? 24 : 34}px;row-gap:${items.length > 8 ? 4 : items.length > 4 ? 7 : 12}px;text-align:left">${items.map(([n, sk, t], i) => `<div style="display:flex;gap:10px;align-items:flex-start">${badge(i + 1)}<div><div style="font:600 ${fs[0]}px Outfit,Arial;color:${GR.dark}">${e(n)}${t ? `<span style="font:500 10.5px Outfit,Arial;color:${GR.mid};margin-left:8px;letter-spacing:.06em">TERM ${e(t)}</span>` : ''}</div><div style="font-size:${fs[1]}px;color:${GR.grey};line-height:${compact ? 1.28 : 1.35}">${e(sk)}</div></div></div>`).join('')}</div>`;
  }
  function termMiddle(c) {
    const items = TERM_PROJECTS[c.grade] || TERM_PROJECTS[6];
    return `<div style="position:absolute;left:0;right:0;top:146px;text-align:center">
        ${label('Certificate of Completion')}
        <div style="font-size:15px;color:${GR.grey};margin-top:14px">This certificate is proudly presented to</div>
        <div style="font:700 46px Outfit,Arial;line-height:60px;height:60px;padding-bottom:10px;color:${GR.dark};margin-top:2px">${e(c.firstName)} ${e(c.lastName)}</div>
        <div style="width:420px;height:1px;background:${GR.soft};margin:14px auto 8px"></div>
        <div style="font-size:16px;color:${GR.text}">for successfully completing <b>Term 1</b> of the Technology and Career Center programme</div>
        <div style="font-size:14px;color:${GR.grey};margin-top:2px">${classLabel(c)} &nbsp;|&nbsp; Academic Year 2026-2027</div>
        <div style="margin:14px auto 0;width:900px;border-top:1px solid ${GR.faint};padding-top:10px">
          <div style="font:600 10.5px Outfit,Arial;letter-spacing:.28em;color:${GR.muted};margin-bottom:8px">PROJECTS COMPLETED AND SKILLS ACHIEVED</div>
          ${itemGrid(items)}
        </div>
      </div>`;
  }
  function yearMiddle(c) {
    const items = c.items || [];
    const many = items.length > 6;
    return `<div style="position:absolute;left:0;right:0;top:${many ? 140 : 146}px;text-align:center">
        ${label(c.title || CERT_TITLES[0])}
        <div style="font-size:15px;color:${GR.grey};margin-top:${many ? 10 : 14}px">This certificate is proudly presented to</div>
        <div style="font:700 ${many ? 40 : 46}px Outfit,Arial;line-height:${many ? 52 : 60}px;height:${many ? 52 : 60}px;padding-bottom:10px;color:${GR.dark};margin-top:2px">${e(c.firstName)} ${e(c.lastName)}</div>
        <div style="width:420px;height:1px;background:${GR.soft};margin:${many ? 16 : 14}px auto 8px"></div>
        <div style="font-size:${many ? 15 : 16}px;color:${GR.text}">for successfully completing the Technology and Career Center programme</div>
        <div style="font-size:14px;color:${GR.grey};margin-top:2px">${classLabel(c)} &nbsp;|&nbsp; Academic Year ${e(c.year || '2026-2027')}</div>
        <div style="margin:${many ? 8 : 14}px auto 0;width:${many ? 980 : 930}px;border-top:1px solid ${GR.faint};padding-top:${many ? 8 : 10}px">
          <div style="font:600 10.5px Outfit,Arial;letter-spacing:.28em;color:${GR.muted};margin-bottom:${many ? 6 : 8}px">PROJECTS COMPLETED AND SKILLS ACHIEVED</div>
          ${itemGrid(items, many)}
        </div>
      </div>`;
  }
  // opts: { signers: [...keys], mode: 'digital' | 'print', sigs: { key: dataUrl }, names: { key: name } }
  function signerList(opts) {
    const names = opts.names || {};
    const keys = (opts.signers && opts.signers.length ? opts.signers : ['lubna', 'dilan']).filter((k) => SIGNERS[k]).slice(0, MAX_SIGNERS);
    // roleOnly: print only the role (no name) for the TCC Director and the ENS Dubai, Acting Campus Principal.
    return keys.map((k) => ({ k, name: opts.roleOnly && !SIGNERS[k].fixed ? '' : (names[k] || SIGNERS[k].name), role: SIGNERS[k].role, sig: opts.mode === 'digital' ? (opts.sigs || {})[k] : '' }));
  }
  function frame(c, middle, opts, sealFile, dateIso) {
    const list = signerList(opts);
    const w = list.length > 2 ? 200 : 250;
    const sigBlock = (s) => `<div style="text-align:center;width:${w}px">
        <div style="height:66px;display:flex;align-items:flex-end;justify-content:center">${s.sig ? `<img src="${s.sig}" style="max-height:62px;max-width:${w - 30}px">` : ''}</div>
        <div style="border-top:1.5px solid ${GR.text};margin:4px 16px 0"></div>
        ${s.name ? `<div style="font:600 ${list.length > 2 ? 14 : 15}px Outfit,Arial;margin-top:8px;color:${GR.text}">${e(s.name)}</div>
        <div style="font-size:12px;color:${GR.muted};margin-top:2px">${e(s.role)}</div>` : `<div style="font:600 ${list.length > 2 ? 14 : 15}px Outfit,Arial;margin-top:8px;color:${GR.text}">${e(s.role.split(', ').slice(-1)[0])}</div><div style="font-size:12px;color:${GR.muted};margin-top:2px">${s.role.includes(', ') ? e(s.role.split(', ')[0]) : '&nbsp;'}</div>`}</div>`;
    const dateBlock = `<div style="text-align:center;width:250px"><div style="height:66px;display:flex;align-items:flex-end;justify-content:center;font:600 16px Outfit,Arial;color:${GR.text}">${fmtDate(dateIso)}</div><div style="border-top:1.5px solid ${GR.text};margin:4px 16px 0"></div><div style="font:600 15px Outfit,Arial;margin-top:8px">Date</div><div style="font-size:12px;color:${GR.muted};margin-top:2px">Emirates National Schools, Dubai</div></div>`;
    let row, topSeal = '';
    if (list.length > 2) {
      // Three or four signers: the seal sits in the middle of the signature row.
      const items = list.map(sigBlock); items.splice(Math.ceil(list.length / 2), 0, `<img src="assets/img/${sealFile}.png" style="width:112px;height:112px">`);
      row = `<div style="position:absolute;left:66px;right:66px;bottom:74px;display:flex;justify-content:space-around;align-items:flex-end">${items.join('')}</div>`;
    } else {
      const seal = `<img src="assets/img/${sealFile}.png" style="width:132px;height:132px">`;
      const left = list.length > 1 ? sigBlock(list[0]) : dateBlock;
      row = `<div style="position:absolute;left:96px;right:96px;bottom:74px;display:flex;justify-content:space-between;align-items:flex-end">${left}${seal}${sigBlock(list[list.length - 1])}</div>`;
    }
    return `<div style="position:relative;width:1123px;height:794px;background:#fff;font-family:Outfit,Arial;font-weight:400">
      <div style="position:absolute;inset:26px;border:1.5px solid ${GR.mid}"></div>
      ${[['top:36px;left:36px', 'border-top', 'border-left'], ['top:36px;right:36px', 'border-top', 'border-right'], ['bottom:36px;left:36px', 'border-bottom', 'border-left'], ['bottom:36px;right:36px', 'border-bottom', 'border-right']].map(([pos, b1, b2]) => `<div style="position:absolute;${pos};width:40px;height:40px;${b1}:3px solid ${GR.dark};${b2}:3px solid ${GR.dark}"></div>`).join('')}
      <img src="assets/img/tcd-logo-print.png" style="position:absolute;top:52px;left:82px;height:68px;width:224px">
      <img src="assets/img/tcc-logo.png" style="position:absolute;top:56px;right:82px;height:60px;width:167px">
      ${topSeal}${middle}${row}
      <div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:10.5px;color:#8A979E;letter-spacing:.04em">Certificate ID ${e(c.certId)} &nbsp;|&nbsp; Issued ${fmtDate(dateIso)} &nbsp;|&nbsp; Technology and Career Center, Emirates National Schools, Dubai</div>
    </div>`;
  }
  function certificateHtml(c, opts) {
    opts = opts || {};
    const isTerm = c.projectId === 'TERM1';
    const P = D.projects[c.projectId] || {};
    const what = isTerm ? '' : `the <b style="font-weight:700">${e(P.name)}</b> project`;
    return frame(c, isTerm ? termMiddle(c) : projectMiddle(c, what, certSkills(c)), opts, isTerm ? 'tcc-seal-term' : 'tcc-seal', c.approvedAt);
  }
  // Year-end certificate. c: { firstName, lastName, grade, section, title, items: [[name, skills, term]], certId, date }
  function yearCertificateHtml(c, opts) { return frame(c, yearMiddle(c), opts || {}, 'tcc-seal-year', c.date); }
  async function certificate(c, opts) {
    const isTerm = c.projectId === 'TERM1'; const P = D.projects[c.projectId] || {};
    await toPdf(certificateHtml(c, opts), 1123, 794, `TCD_Certificate_${c.firstName}_${c.lastName}_${isTerm ? 'Term1' : (P.name || c.projectId)}.pdf`.replace(/[^\w.-]+/g, '_'), 'landscape');
  }
  // Many year-end certificates in one PDF, one page each. onProgress(done, total) is optional.
  async function yearCertificates(list, opts, filename, onProgress) {
    const host = document.getElementById('render');
    const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    for (let i = 0; i < list.length; i++) {
      host.innerHTML = `<div id="pg" style="${BASE}width:1123px;height:794px;position:relative;overflow:hidden">${yearCertificateHtml(list[i], opts)}</div>`;
      const pg = host.querySelector('#pg');
      await (document.fonts ? document.fonts.ready : Promise.resolve());
      await Promise.all([...pg.querySelectorAll('img')].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
      const canvas = await html2canvas(pg, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      if (i) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ph);
      if (onProgress) onProgress(i + 1, list.length);
    }
    host.innerHTML = '';
    pdf.save(filename);
  }

  // ---------- Term Skills Assessment ----------
  const fmtTime = (sec) => { sec = Math.max(0, Math.round(+sec || 0)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  // Score per project from the stored answers: [{ q, ok }]
  function breakdown(L, answers) {
    const ans = typeof answers === 'string' ? (() => { try { return JSON.parse(answers); } catch (x) { return []; } })() : (answers || []);
    const okBy = {}; ans.forEach((x) => { okBy[x.q] = +x.ok ? 1 : 0; });
    return (L.projects || []).map((P) => {
      const idx = L.quiz.map((q, i) => (q.p === P.id ? i : -1)).filter((i) => i >= 0);
      const right = idx.reduce((n, i) => n + (okBy[i] || 0), 0);
      return { id: P.id, name: P.name, skills: P.skills, right, total: idx.length, percent: idx.length ? Math.round(right * 100 / idx.length) : 0 };
    });
  }
  const PLACE = ['1st', '2nd', '3rd'];
  function assessMiddle(c) {
    const ex = c.rank && c.rank <= 3;
    const items = c.breakdown || [];
    const cols = items.length > 4 ? 3 : 2;
    const grid = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);column-gap:26px;row-gap:9px;text-align:left">${items.map((p, i) => `<div style="display:flex;gap:10px;align-items:flex-start">${badge(i + 1)}<div style="flex:1"><div style="display:flex;justify-content:space-between;gap:8px;font:600 13.5px Outfit,Arial;color:${GR.dark}"><span>${e(p.name)}</span><span style="color:${GR.mid}">${p.percent}%</span></div><div style="font-size:11.5px;line-height:1.35;color:${GR.grey};margin-top:2px">${p.skills.map(e).join(', ')}</div></div></div>`).join('')}</div>`;
    return `<div style="position:absolute;left:0;right:0;top:168px;text-align:center">
        ${label(ex ? 'Certificate of Excellence' : 'Term 1 Skills Certificate')}
        <div style="font-size:15px;color:${GR.grey};margin-top:12px">This certificate is proudly presented to</div>
        <div style="font:700 44px Outfit,Arial;line-height:58px;height:58px;padding-bottom:10px;color:${GR.dark};margin-top:2px">${e(c.firstName)} ${e(c.lastName)}</div>
        <div style="width:420px;height:1px;background:${GR.soft};margin:12px auto 8px"></div>
        <div style="font-size:16px;color:${GR.text}">${ex ? `for achieving <b>${PLACE[c.rank - 1]} place</b> in the Term 1 Skills Assessment of the Technology and Career Center programme` : 'for completing the <b>Term 1 Skills Assessment</b> of the Technology and Career Center programme'}</div>
        <div style="font-size:14px;color:${GR.grey};margin-top:2px">${classLabel(c)} &nbsp;|&nbsp; Overall score <b style="color:${GR.dark}">${c.percent}%</b> (${level(c.percent)}) &nbsp;|&nbsp; Academic Year 2026-2027</div>
        <div style="margin:12px auto 0;width:930px;border-top:1px solid ${GR.faint};padding-top:9px">
          <div style="font:600 10.5px Outfit,Arial;letter-spacing:.28em;color:${GR.muted};margin-bottom:8px">SCORE AND SKILLS BY PROJECT</div>
          ${grid}
        </div>
      </div>`;
  }
  function assessCertificateHtml(c, opts) { return frame(c, assessMiddle(c), opts || {}, c.rank && c.rank <= 3 ? 'tcc-seal-year' : 'tcc-seal-term', c.date); }
  // list: certificate data; optsFor(c) gives the signer options for each one.
  async function assessCertificates(list, optsFor, filename, onProgress) {
    const host = document.getElementById('render');
    const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    for (let i = 0; i < list.length; i++) {
      host.innerHTML = `<div id="pg" style="${BASE}width:1123px;height:794px;position:relative;overflow:hidden">${assessCertificateHtml(list[i], optsFor(list[i]))}</div>`;
      const pg = host.querySelector('#pg');
      await (document.fonts ? document.fonts.ready : Promise.resolve());
      await Promise.all([...pg.querySelectorAll('img')].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
      const canvas = await html2canvas(pg, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      if (i) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ph);
      if (onProgress) onProgress(i + 1, list.length);
    }
    host.innerHTML = '';
    pdf.save(filename);
  }

  // ---------- Term report card ----------
  async function reportCard(st, attempts, rubrics, certs, gradePlan) {
    const pids = [];
    gradePlan.plan.forEach((w) => { if (w.project && !pids.includes(w.project)) pids.push(w.project); });
    const rowsHtml = pids.map((pid) => {
      const P = D.projects[pid] || {};
      const weeks = gradePlan.plan.filter((w) => w.project === pid).map((w) => w.week);
      const quizLessons = gradePlan.plan.filter((w) => w.project === pid && w.lessonId).map((w) => w.lessonId);
      const mine = attempts.filter((a) => a.projectId === pid);
      const best = {}; mine.forEach((a) => { if (!best[a.lessonId] || +a.percent > +best[a.lessonId].percent) best[a.lessonId] = a; });
      const vals = Object.values(best);
      const avg = vals.length ? Math.round(vals.reduce((s, a) => s + +a.percent, 0) / vals.length) : null;
      const cert = certs.find((c) => c.projectId === pid);
      return `<tr><td style="padding:6px 9px;border:1px solid #DDE6E8;font-weight:600">${e(P.name || pid)}</td><td style="padding:6px 9px;border:1px solid #DDE6E8;text-align:center">${weeks[0]}${weeks.length > 1 ? ' to ' + weeks[weeks.length - 1] : ''}</td><td style="padding:6px 9px;border:1px solid #DDE6E8;text-align:center">${quizLessons.length ? vals.length + ' of ' + quizLessons.length : 'n/a'}</td><td style="padding:6px 9px;border:1px solid #DDE6E8;text-align:center">${avg == null ? '-' : avg + '%'}</td><td style="padding:6px 9px;border:1px solid #DDE6E8;text-align:center">${avg == null ? '-' : level(avg)}</td><td style="padding:6px 9px;border:1px solid #DDE6E8;text-align:center">${cert ? '&#10003;' : '-'}</td></tr>`;
    }).join('');
    const rb = rubrics.filter((r) => pids.includes(r.projectId) && (r.c1 || r.c2 || r.c3 || r.c4 || r.c5));
    const rubricHtml = rb.length ? `<div style="font:700 16px Outfit,Arial;color:#0A5C5F;margin:12px 0 6px">Framework rubric</div>
      <table style="width:100%;border-collapse:collapse;font-size:11.5px"><tr style="background:#E6F2F2"><th style="text-align:left;padding:7px 8px;border:1px solid #DDE6E8">Project</th>${CRIT.map(([, n, w]) => `<th style="padding:7px 6px;border:1px solid #DDE6E8">${n} (${w})</th>`).join('')}</tr>
      ${rb.map((r) => `<tr><td style="padding:7px 8px;border:1px solid #DDE6E8;font-weight:600">${e((D.projects[r.projectId] || {}).name || r.projectId)}</td>${CRIT.map(([k]) => `<td style="padding:7px 6px;border:1px solid #DDE6E8;text-align:center">${e(r[k] || '-')}</td>`).join('')}</tr>`).join('')}</table>` : '';
    const latest = (k) => { const xs = attempts.filter((a) => a[k]).sort((x, y) => String(y.behaviourAt || y.submittedAt).localeCompare(String(x.behaviourAt || x.submittedAt))); return xs.length ? xs[0][k] : ''; };
    const counts = {}; attempts.forEach((a) => { if (a.behaviour) counts[a.behaviour] = (counts[a.behaviour] || 0) + 1; });
    const usual = Object.keys(counts).sort((x, y) => counts[y] - counts[x] || BEHAVIOUR.indexOf(x) - BEHAVIOUR.indexOf(y))[0] || '';
    const comments = rubrics.filter((r) => r.comment).map((r) => r.comment);
    const all = attempts.length ? Math.round(attempts.reduce((s, a) => s + +a.percent, 0) / attempts.length) : null;
    const html = `${header('Term 1 Report Card', 'TCD | ' + YEAR)}
      <div style="padding:8px 48px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:10px">
        ${box('Student name', st.firstName + ' ' + st.lastName)}${box('Class', cls(st))}${box('Term', 'Term 1')}${box('Overall quiz average', all == null ? '-' : all + '% (' + level(all) + ')')}
      </div>
      <div style="padding:6px 48px">
        <div style="font:700 16px Outfit,Arial;color:#0A5C5F;margin:10px 0 6px">Project performance</div>
        <table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr style="background:#E6F2F2"><th style="text-align:left;padding:6px 9px;border:1px solid #DDE6E8">Project</th><th style="padding:6px 9px;border:1px solid #DDE6E8">Weeks</th><th style="padding:6px 9px;border:1px solid #DDE6E8">Quizzes completed</th><th style="padding:6px 9px;border:1px solid #DDE6E8">Average</th><th style="padding:6px 9px;border:1px solid #DDE6E8">Level</th><th style="padding:6px 9px;border:1px solid #DDE6E8">Certificate</th></tr>${rowsHtml}</table>
        ${rubricHtml}
        <div style="font:700 16px Outfit,Arial;color:#0A5C5F;margin:12px 0 6px">Behaviour and project completion</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div style="border:1px solid #DDE6E8;border-radius:10px;padding:10px 12px"><div style="font:600 13px Outfit,Arial;margin-bottom:6px">Overall class behaviour this term</div>${pill(usual)}</div><div style="border:1px solid #DDE6E8;border-radius:10px;padding:10px 12px"><div style="font:600 13px Outfit,Arial;margin-bottom:6px">Latest project completion</div>${pill(latest('completion'))}</div></div>
        <div style="font:700 16px Outfit,Arial;color:#0A5C5F;margin:12px 0 6px">Instructor comment</div>
        <div style="border:1px solid #DDE6E8;border-radius:10px;padding:12px 14px;min-height:60px;font-size:13px;line-height:1.5;text-align:justify">${e(comments.join(' ')) || '&nbsp;'}</div>
      </div>
      <div style="padding:14px 48px 0">${sigs()}</div>
      <div style="padding:10px 48px 14px;font-size:10.5px;color:#6B7A84">Levels: Advanced 85% and above | Proficient 70% to 84% | Developing 50% to 69% | Emerging below 50%. Rubric weights follow the TCD Applied Design, Skills and Technologies Framework.</div>
      ${footer()}`;
    await toPdf(html, 794, 1123, `TCD_Term1_Report_Card_${st.firstName}_${st.lastName}.pdf`.replace(/\s+/g, '_'), 'portrait');
  }

  // ---------- Excel class list ----------
  function classList(attempts, name) {
    const rows = attempts.map((a) => {
      const L = D.lessons[a.lessonId] || {};
      return { 'First name': a.firstName, 'Last name': a.lastName, Grade: a.grade, Section: a.section, Project: (D.projects[a.projectId] || {}).name || a.projectId, Week: L.week || a.week, Lesson: L.title || a.lessonId, Marks: `${a.correct}/${a.total}`, 'Score (%)': +a.percent, Level: level(+a.percent), 'Game points': +a.points, Attempt: +a.attemptNo, 'Class behaviour': a.behaviour || '', 'Project completion': a.completion || '', 'Behaviour note': a.behaviourNote || '', Date: a.submittedAt ? new Date(a.submittedAt).toLocaleString('en-GB') : '' };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || { a: 1 }).map((k) => ({ wch: Math.max(10, k.length + 2) }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, name);
  }

  window.Docs = { breakdown, fmtTime, assessCertificateHtml, assessCertificates, scoreReport, certificate, certificateHtml, yearCertificateHtml, yearCertificates, INSTRUCTORS, SIGNERS, MAX_SIGNERS, YEAR_PROJECTS, CERT_TITLES, reportCard, classList, level, BEHAVIOUR, COMPLETION, CRIT };
})();
