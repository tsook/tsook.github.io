/* Minimap rail: one tick per section or paper, evenly spaced, grouped by section.
   Ticks near the pointer magnify and the nearest one shows its label. Click jumps, drag scrubs.
   Modeled on the scrubber ChatGPT shows beside long conversations. */
export function initMinimap(){
  const nav = document.getElementById('minimap'); if(!nav) return;
  const rail = document.getElementById('mm-rail');
  const label = document.getElementById('mm-label');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticks = [], raf = 0;
  const visible = el => el.offsetParent !== null;
  function build(){
    const items = [...document.querySelectorAll('[data-spy]')].filter(visible);
    rail.innerHTML = '';
    ticks = items.map((el, i) => {
      const sec = el.hasAttribute('data-section');
      const a = document.createElement('a');
      a.className = 'mm-tick' + (sec ? ' is-section' : '') + (sec && i > 0 ? ' gap-before' : '');
      a.href = '#' + el.id; a.dataset.spyLink = el.id; a.dataset.label = el.dataset.label || el.id;
      a.setAttribute('aria-label', a.dataset.label);
      rail.appendChild(a);
      return {el, a, y:0, top:0};
    });
    measure(); spy();
  }
  function measure(){
    const r = rail.getBoundingClientRect();
    ticks.forEach(t => { const b = t.a.getBoundingClientRect(); t.y = b.top - r.top + b.height/2; t.top = t.el.getBoundingClientRect().top + window.scrollY; });
  }
  function spy(){
    if(!ticks.length) return;
    const pos = window.scrollY + window.innerHeight * 0.35;
    let cur = ticks[0];
    ticks.forEach(t => { if(t.top - 8 <= pos) cur = t; });
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) cur = ticks[ticks.length-1];
    ticks.forEach(t => t.a.classList.toggle('is-current', t===cur));
    document.querySelectorAll('.toc [data-spy-link]').forEach(l => l.classList.toggle('is-current', l.dataset.spyLink===cur.el.id));
    const theme = cur.el.closest('.theme') || (cur.el.classList.contains('theme') ? cur.el : null);
    const tid = theme ? theme.id.replace(/^t-/, '') : null;
    document.querySelectorAll('.tl').forEach(a => a.classList.toggle('is-current', a.dataset.theme === tid));
  }
  function nearestTo(clientY){
    const r = rail.getBoundingClientRect(); const y = clientY - r.top;
    let nearest = null, best = 1e9;
    ticks.forEach(t => {
      const dy = Math.abs(t.y - y);
      const m = 1 + 1.9 * Math.max(0, 1 - dy / 42);
      t.a.style.setProperty('--m', m.toFixed(3));
      if(dy < best){ best = dy; nearest = t; }
    });
    return {nearest, best};
  }
  function showLabel(t){
    if(!t){ label.hidden = true; return; }
    label.hidden = false; label.textContent = t.a.dataset.label; label.style.top = t.y + 'px';
  }
  function clear(){ ticks.forEach(t => t.a.style.removeProperty('--m')); label.hidden = true; }
  function jump(t, behavior){ window.scrollTo({top: Math.max(0, t.top - 96), behavior: reduced ? 'auto' : behavior}); }
  let dragging = false, last = null;
  nav.addEventListener('pointermove', e => {
    const {nearest, best} = nearestTo(e.clientY);
    showLabel(best < 60 ? nearest : null);
    if(dragging && nearest && nearest !== last){ last = nearest; jump(nearest, 'auto'); }
  });
  nav.addEventListener('pointerleave', () => { if(!dragging) clear(); });
  nav.addEventListener('pointerdown', e => {
    dragging = true; nav.setPointerCapture(e.pointerId);
    const {nearest} = nearestTo(e.clientY); if(nearest){ last = nearest; jump(nearest, 'smooth'); showLabel(nearest); }
    e.preventDefault();
  });
  const end = e => { dragging = false; last = null; try{ nav.releasePointerCapture(e.pointerId); }catch(_){} clear(); };
  nav.addEventListener('pointerup', end); nav.addEventListener('pointercancel', end);
  nav.addEventListener('click', e => e.preventDefault());
  window.addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; spy(); }); }, {passive:true});
  window.addEventListener('resize', () => { measure(); spy(); });
  document.addEventListener('options-change', () => requestAnimationFrame(build));
  if(document.fonts) document.fonts.ready.then(() => { measure(); spy(); });
  build();
  setTimeout(() => { measure(); spy(); }, 800);

  /* bio phrases hint their theme section */
  document.querySelectorAll('.tl').forEach(a => {
    const sec = () => document.getElementById('t-' + a.dataset.theme);
    a.addEventListener('mouseenter', () => sec()?.classList.add('is-hinted'));
    a.addEventListener('mouseleave', () => sec()?.classList.remove('is-hinted'));
    a.addEventListener('focus', () => sec()?.classList.add('is-hinted'));
    a.addEventListener('blur', () => sec()?.classList.remove('is-hinted'));
  });
}
