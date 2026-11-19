/* Hook screen: one picture, one question and a clear voice, then a 30-second think-pair-share. */
window.HookPlayer = function (el, lesson, project) {
  const H = lesson.hook || {};
  const vid = H.video && H.video.url ? (/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/.exec(H.video.url) || [])[1] : null;
  const img = H.image || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : 'assets/gallery/showcase-table.jpg');
  let screen = 0, timer = null, left = 30;
  el.innerHTML = `<div class="hook2" tabindex="0" aria-label="Hook">
      <div class="h2-pic" style="background-image:url('${img}')"></div><div class="h2-shade"></div>
      <div class="h2-body"></div>
      <div class="h2-ctrls"><button data-a="voice" aria-label="Read aloud">${icon('VolumeUp')}</button><button data-a="full" aria-label="Full screen">${icon('Expand')}</button></div>
      <img class="h2-logo" src="assets/img/tcd-logo.png" alt="">
    </div>`;
  const box = el.querySelector('.hook2'), body = el.querySelector('.h2-body');
  function voice() {
    const vs = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
    const pref = [/Natural/i, /Google UK English Female/i, /Sonia|Libby|Hazel|Serena|Kate/i, /en-GB/i, /en-US/i, /^en/i];
    for (const p of pref) { const v = vs.find((x) => p.test(x.name) || p.test(x.lang)); if (v) return v; }
    return null;
  }
  function say(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); const v = voice();
    if (v) u.voice = v; u.lang = (v && v.lang) || 'en-GB'; u.rate = 0.9; u.pitch = 1.02;
    speechSynthesis.speak(u);
  }
  function render() {
    clearInterval(timer);
    if (screen === 0) {
      body.innerHTML = `<div class="h2-kick">${esc(project.name)} | Week ${lesson.week}</div><h2 class="h2-q">${esc(H.question)}</h2>
        <div class="h2-btns"><button class="btn gold lg" data-a="next">${icon('UserFriends')} Talk with a partner</button></div>`;
    } else {
      left = 30;
      body.innerHTML = `<div class="h2-kick">Think, pair, share</div><h2 class="h2-q small">${esc(H.question)}</h2>
        <div class="h2-timer"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="tr"/><circle cx="60" cy="60" r="52" class="tp" id="tp"/></svg><b id="tl">30</b></div>
        <div class="h2-btns"><button class="btn alt" data-a="back">${icon('ChevronLeft')} Back</button>${vid ? `<button class="btn gold" data-a="video">${icon('Youtube')} Watch: ${esc(H.video.title)}</button>` : ''}</div>`;
      const tp = body.querySelector('#tp'), tl = body.querySelector('#tl'); const C = 2 * Math.PI * 52; tp.style.strokeDasharray = C;
      timer = setInterval(() => { left--; tl.textContent = Math.max(0, left); tp.style.strokeDashoffset = C * (1 - left / 30); if (left <= 0) { clearInterval(timer); tl.innerHTML = icon('Check'); say('Time is up. Who would like to share?'); } }, 1000);
    }
  }
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'voice') say(screen === 0 ? H.question : 'Talk with your partner for thirty seconds. ' + H.question);
    if (a === 'full') { document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen && box.requestFullscreen(); }
    if (a === 'next') { screen = 1; render(); say('Talk with your partner for thirty seconds.'); }
    if (a === 'back') { screen = 0; render(); }
    if (a === 'video') { const v = document.getElementById('ytbox'); if (v) { v.scrollIntoView({ behavior: 'smooth' }); } }
  });
  render();
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  return { destroy() { clearInterval(timer); if ('speechSynthesis' in window) speechSynthesis.cancel(); } };
};
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
