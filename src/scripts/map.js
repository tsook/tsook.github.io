/* Page map: a rail of ticks at the right edge, one per section or paper, grouped by section.
   Ticks near the pointer magnify and the nearest one shows its label. Click jumps, drag scrubs. */
export function initMap(){
  const nav = document.getElementById('map'); if(!nav) return;
  const rail = document.getElementById('map-items');
  const phrases = [...document.querySelectorAll('.tl')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticks = [], raf = 0;

  function measure(){
    const r = rail.getBoundingClientRect();
    ticks = [...rail.querySelectorAll('[data-map]')].map(a => {
      const el = document.getElementById(a.dataset.map); if(!el) return null;
      const b = a.getBoundingClientRect();
      return { el, a, y: b.top - r.top + b.height/2, top: el.getBoundingClientRect().top + window.scrollY };
    }).filter(Boolean);
  }
  function spy(){
    if(!ticks.length) return;
    const pos = window.scrollY + window.innerHeight * 0.3;
    let cur = ticks[0];
    ticks.forEach(t => { if(t.top - 8 <= pos) cur = t; });
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) cur = ticks[ticks.length-1];
    ticks.forEach(t => t.a.classList.toggle('is-current', t === cur));
    const theme = cur.el.closest('.theme') || (cur.el.classList.contains('theme') ? cur.el : null);
    const tid = theme ? theme.id.replace(/^t-/, '') : null;
    phrases.forEach(a => a.classList.toggle('is-current', a.dataset.theme === tid));
  }
  function nearestTo(clientY){
    const r = rail.getBoundingClientRect(); const y = clientY - r.top;
    let nearest = null, best = 1e9;
    ticks.forEach(t => {
      const dy = Math.abs(t.y - y);
      const k = Math.max(0, 1 - dy / 44);
      t.a.style.setProperty('--m', (1 + 1.6 * k).toFixed(3));
      t.a.style.setProperty('--k', k.toFixed(3));
      if(dy < best){ best = dy; nearest = t; }
    });
    return { nearest, best };
  }
  function clear(){ ticks.forEach(t => { t.a.style.removeProperty('--m'); t.a.style.removeProperty('--k'); }); }
  function jump(t, behavior){ window.scrollTo({ top: Math.max(0, t.top - 28), behavior: reduced ? 'auto' : behavior }); }
  const schedule = fn => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); };

  let dragging = false, last = null, downId = null;
  nav.addEventListener('pointermove', e => {
    const { nearest } = nearestTo(e.clientY);
    if(dragging && nearest && nearest !== last){ last = nearest; jump(nearest, 'auto'); }
  });
  nav.addEventListener('pointerleave', () => { if(!dragging) clear(); });
  nav.addEventListener('pointerdown', e => {
    if(e.button !== 0) return;
    dragging = true; downId = e.pointerId; try{ nav.setPointerCapture(e.pointerId); }catch(_){}
    const { nearest } = nearestTo(e.clientY); if(nearest){ last = nearest; jump(nearest, 'smooth'); }
    e.preventDefault();
  });
  const end = () => { dragging = false; last = null; if(downId != null){ try{ nav.releasePointerCapture(downId); }catch(_){} downId = null; } clear(); };
  nav.addEventListener('pointerup', end); nav.addEventListener('pointercancel', end);
  nav.addEventListener('click', e => e.preventDefault());
  nav.addEventListener('keydown', e => {
    const a = e.target.closest('[data-map]'); if(!a || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault(); const t = ticks.find(t => t.a === a); if(t) jump(t, 'smooth');
  });

  window.addEventListener('scroll', () => schedule(spy), { passive:true });
  const remeasure = () => schedule(() => { measure(); spy(); });
  window.addEventListener('resize', remeasure);
  if('ResizeObserver' in window){ const ro = new ResizeObserver(remeasure); const main = document.getElementById('main'); if(main) ro.observe(main); ro.observe(document.body); }
  if(document.fonts) document.fonts.ready.then(remeasure);
  measure(); spy();
  setTimeout(remeasure, 800);

  /* bio phrases hint their theme section */
  phrases.forEach(a => {
    const sec = () => document.getElementById('t-' + a.dataset.theme);
    const on = () => sec()?.classList.add('is-hinted'), off = () => sec()?.classList.remove('is-hinted');
    a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
}
