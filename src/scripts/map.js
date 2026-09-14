/* Sidebar map. Each row stands for one section or paper. A translucent window shows
   which rows are on screen, mapped piecewise from page position to row position.
   Click a row to jump; drag anywhere on the map to scrub the page. */
export function initMap(){
  const nav = document.getElementById('map'); if(!nav) return;
  const view = document.getElementById('map-view');
  const rows = [...nav.querySelectorAll('[data-map]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let items = [], docH = 1, raf = 0;

  function measure(){
    const nr = nav.getBoundingClientRect();
    docH = document.documentElement.scrollHeight;
    items = rows.map(a => {
      const el = document.getElementById(a.dataset.map); if(!el) return null;
      const r = a.getBoundingClientRect();
      return { el, a, top: el.getBoundingClientRect().top + window.scrollY, y: r.top - nr.top, h: r.height };
    }).filter(Boolean);
  }
  /* page y to map y and back, piecewise linear between rows */
  function toMap(py){
    if(!items.length) return 0;
    if(py <= items[0].top) return items[0].y;
    for(let i = 0; i < items.length; i++){
      const a = items[i], b = items[i+1];
      const t1 = b ? b.top : docH, y1 = b ? b.y : a.y + a.h;
      if(py < t1){ const f = (py - a.top) / Math.max(1, t1 - a.top); return a.y + f * (y1 - a.y); }
    }
    const l = items[items.length-1]; return l.y + l.h;
  }
  function toPage(my){
    if(!items.length) return 0;
    if(my <= items[0].y) return 0;
    for(let i = 0; i < items.length; i++){
      const a = items[i], b = items[i+1];
      const t1 = b ? b.top : docH, y1 = b ? b.y : a.y + a.h;
      if(my < y1){ const f = (my - a.y) / Math.max(1, y1 - a.y); return a.top + f * (t1 - a.top); }
    }
    return docH;
  }
  function update(){
    if(!items.length) return;
    const y0 = toMap(window.scrollY), y1 = toMap(window.scrollY + window.innerHeight);
    view.style.setProperty('--vt', y0.toFixed(1) + 'px');
    view.style.setProperty('--vh', Math.max(8, y1 - y0).toFixed(1) + 'px');
    const pos = window.scrollY + window.innerHeight * 0.3;
    let cur = items[0];
    items.forEach(t => { if(t.top - 8 <= pos) cur = t; });
    if(window.scrollY + window.innerHeight >= docH - 4) cur = items[items.length-1];
    items.forEach(t => t.a.classList.toggle('is-current', t === cur));
    const theme = cur.el.closest('.theme') || (cur.el.classList.contains('theme') ? cur.el : null);
    const tid = theme ? theme.id.replace(/^t-/, '') : null;
    document.querySelectorAll('.tl').forEach(a => a.classList.toggle('is-current', a.dataset.theme === tid));
  }
  /* drag to scrub */
  let down = null, dragging = false;
  const scrubTo = clientY => {
    const my = clientY - nav.getBoundingClientRect().top;
    window.scrollTo({ top: Math.max(0, toPage(my) - window.innerHeight * 0.3), behavior: 'auto' });
  };
  nav.addEventListener('pointerdown', e => { if(e.button !== 0) return; down = { y: e.clientY, id: e.pointerId }; dragging = false; });
  nav.addEventListener('pointermove', e => {
    if(!down) return;
    if(!dragging && Math.abs(e.clientY - down.y) > 4){ dragging = true; nav.classList.add('is-dragging'); try{ nav.setPointerCapture(down.id); }catch(_){} }
    if(dragging) scrubTo(e.clientY);
  });
  const end = e => {
    if(!down) return;
    if(dragging){ try{ nav.releasePointerCapture(down.id); }catch(_){} nav.classList.remove('is-dragging'); }
    down = null; setTimeout(() => { dragging = false; }, 0);
  };
  nav.addEventListener('pointerup', end); nav.addEventListener('pointercancel', end);
  nav.addEventListener('click', e => {
    if(dragging){ e.preventDefault(); return; }
    const a = e.target.closest('[data-map]'); if(!a) return;
    e.preventDefault();
    const it = items.find(t => t.a === a); if(!it) return;
    window.scrollTo({ top: Math.max(0, it.top - 28), behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + a.dataset.map);
  });

  window.addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive:true });
  window.addEventListener('resize', () => { measure(); update(); });
  if(document.fonts) document.fonts.ready.then(() => { measure(); update(); });
  measure(); update();
  setTimeout(() => { measure(); update(); }, 800);
  setTimeout(() => { measure(); update(); }, 2500);

  /* bio phrases hint their theme section */
  document.querySelectorAll('.tl').forEach(a => {
    const sec = () => document.getElementById('t-' + a.dataset.theme);
    const on = () => sec()?.classList.add('is-hinted'), off = () => sec()?.classList.remove('is-hinted');
    a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
}
