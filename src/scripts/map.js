/* Page map: a miniature of the page. One block per paper (and one for the publication list),
   heights proportional to the page, a translucent window for what is on screen.
   Click a block to jump; drag anywhere on the map to scrub. */
export function initMap(){
  const nav = document.getElementById('map'); if(!nav) return;
  const view = document.getElementById('map-view');
  const rows = [...nav.querySelectorAll('[data-map]')];
  const phrases = [...document.querySelectorAll('.tl')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let items = [], docH = 1, raf = 0;

  function measure(){
    docH = document.documentElement.scrollHeight;
    const spans = rows.map(a => {
      const el = document.getElementById(a.dataset.map); if(!el) return null;
      const topEl = a.dataset.top ? document.getElementById(a.dataset.top) || el : el;
      return { a, el, top: topEl.getBoundingClientRect().top + window.scrollY };
    }).filter(Boolean);
    /* proportional heights: the whole page maps onto at most 60vh or 440px */
    const mapH = Math.min(440, window.innerHeight * 0.6) - (spans.length - 1) * 2 - 10;
    const first = spans[0]?.top || 0;
    spans.forEach((s, i) => { const t1 = spans[i+1] ? spans[i+1].top : docH; s.a.style.height = Math.max(8, (t1 - s.top) / Math.max(1, docH - first) * mapH).toFixed(1) + 'px'; });
    const nr = nav.getBoundingClientRect();
    items = spans.map(s => { const r = s.a.getBoundingClientRect(); return { ...s, y: r.top - nr.top, h: r.height }; });
  }
  /* page y to map y and back, piecewise linear between blocks */
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
    view.style.setProperty('--vh', Math.max(10, y1 - y0).toFixed(1) + 'px');
    const pos = window.scrollY + window.innerHeight * 0.3;
    let cur = items[0];
    items.forEach(t => { if(t.top - 8 <= pos) cur = t; });
    if(window.scrollY + window.innerHeight >= docH - 4) cur = items[items.length-1];
    items.forEach(t => t.a.classList.toggle('is-current', t === cur));
    const theme = cur.el.closest('.theme');
    const tid = theme ? theme.id.replace(/^t-/, '') : null;
    phrases.forEach(a => a.classList.toggle('is-current', a.dataset.theme === tid));
  }
  const schedule = fn => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; fn(); }); };

  /* drag to scrub */
  let down = null, dragging = false;
  const scrubTo = clientY => {
    const my = clientY - nav.getBoundingClientRect().top;
    window.scrollTo({ top: Math.max(0, toPage(my) - window.innerHeight * 0.3), behavior: 'auto' });
  };
  const endDrag = () => {
    if(down){ try{ nav.releasePointerCapture(down.id); }catch(_){} }
    nav.classList.remove('is-dragging'); down = null;
    setTimeout(() => { dragging = false; }, 0);
  };
  nav.addEventListener('pointerdown', e => {
    if(e.button !== 0) return;
    down = { y: e.clientY, id: e.pointerId }; dragging = false;
    try{ nav.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  nav.addEventListener('pointermove', e => {
    if(!down) return;
    if(!(e.buttons & 1)){ endDrag(); return; }
    if(!dragging && Math.abs(e.clientY - down.y) > 4){ dragging = true; nav.classList.add('is-dragging'); }
    if(dragging) scrubTo(e.clientY);
  });
  nav.addEventListener('pointerup', endDrag); nav.addEventListener('pointercancel', endDrag);
  nav.addEventListener('click', e => {
    if(dragging){ e.preventDefault(); return; }
    const a = e.target.closest('[data-map]'); if(!a) return;
    e.preventDefault();
    const it = items.find(t => t.a === a); if(!it) return;
    const target = it.el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, target - 28), behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + a.dataset.map);
  });

  window.addEventListener('scroll', () => schedule(update), { passive:true });
  const remeasure = () => schedule(() => { measure(); update(); });
  window.addEventListener('resize', remeasure);
  if('ResizeObserver' in window){
    const ro = new ResizeObserver(remeasure);
    const main = document.getElementById('main'); if(main) ro.observe(main);
    ro.observe(document.body);
  }
  if(document.fonts) document.fonts.ready.then(remeasure);
  measure(); update();
  setTimeout(remeasure, 800);

  /* bio phrases hint their theme section */
  phrases.forEach(a => {
    const sec = () => document.getElementById('t-' + a.dataset.theme);
    const on = () => sec()?.classList.add('is-hinted'), off = () => sec()?.classList.remove('is-hinted');
    a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
}
