import { sleep, cursor, esc, reduced } from '../flow.js';

/* The response is cut into fragments; each fragment serves a function for the criterion and is
   rated for or against it. Functions from every evaluated output are embedded on one map and clustered. */
const FRAGS = [
  { t:"Einstein's theory of relativity describes how space and time are woven together.", fn:'Explains the core mechanism clearly', k:2, pol:'pos' },
  { t:'The special theory shows that the speed of light is the same for every observer,', fn:'States a key principle accurately', k:3, pol:'pos' },
  { t:'while the general theory explains gravity as the curving of spacetime caused by mass and energy.', fn:'Gives a structured two-part explanation', k:4, pol:'pos' },
  { t:'Think of a bowling ball on a trampoline: heavy objects bend the surface, and smaller ones roll toward them.', fn:'Uses an analogy effectively', k:2, pol:'pos' },
  { t:'In short, gravity is just heavy things making dents.', fn:'Oversimplifies a technical concept', k:1, pol:'neg' },
  { t:'That is really all there is to it.', fn:'Omits key caveats', k:6, pol:'neg' },
];
const CL = [
  { n:'Engagement quality', c:'#E9C94A', sub:[['Vivid examples', 5, 1], ['Rhetorical questions', 3, 2]] },
  { n:'Technical precision', c:'#9A9A94', sub:[['Oversimplifies concepts', 1, 6], ['Precise definitions', 4, 0]] },
  { n:'Communication strategy', c:'#4F8BFF', sub:[['Clear explanations', 7, 0], ['Effective analogies', 5, 1], ['Generic filler phrases', 0, 4]] },
  { n:'Factual accuracy', c:'#5BB86A', sub:[['Accurate statements', 8, 0], ['Misstated facts', 0, 3]] },
  { n:'Structural organization', c:'#E58A2B', sub:[['Structured explanations', 6, 0], ['Abrupt transitions', 0, 2]] },
  { n:'Evidence support', c:'#7C6BD6', sub:[['Cites relevant examples', 4, 0], ['Unsupported claims', 0, 3]] },
  { n:'Completeness and depth', c:'#B65BC7', sub:[['Covers key aspects', 3, 0], ['Omits key caveats', 0, 6]] },
  { n:'Analytical reasoning', c:'#2FA5A0', sub:[['Logical reasoning', 5, 0], ['Circular reasoning', 0, 2]] },
];
const R = 94, C = 150, CR = 38;
let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
function layout(){
  seed = 7; const pts = [];
  CL.forEach((cl, k) => {
    const a = -Math.PI/2 + k * Math.PI * 2 / CL.length;
    cl.x = C + R * Math.cos(a); cl.y = C + R * Math.sin(a);
    cl.sub.forEach((sub, j) => {
      const sa = a + (j - (cl.sub.length - 1) / 2) * 1.7; const sr = 18;
      const sx = cl.x + sr * Math.cos(sa), sy = cl.y + sr * Math.sin(sa);
      sub.x = sx; sub.y = sy;
      for(let i = 0; i < sub[1] + sub[2]; i++){
        const r = 4 + rnd() * 11, t = rnd() * Math.PI * 2;
        pts.push({ k, j, x: sx + r * Math.cos(t), y: sy + r * Math.sin(t), pol: i < sub[1] ? 'pos' : 'neg', fn: sub[0] });
      }
    });
  });
  /* attach this output's fragments to points inside their cluster */
  FRAGS.forEach((f, i) => {
    const cand = pts.filter(p => p.k === f.k && p.pol === f.pol && p.frag == null);
    const p = cand[Math.floor(cand.length / 2)] || pts.find(p => p.k === f.k);
    p.frag = i; p.fn = f.fn;
  });
  return pts;
}
const PTS = layout();
const S = d => d._et;

function renderMap(d){
  const svg = d.querySelector('[data-map]'); const s = S(d);
  const cls = CL.map((cl, k) => `<g class="et-cl" data-act="zoom" data-k="${k}" style="--c:${cl.c}" tabindex="0" role="button" aria-label="Zoom into ${esc(cl.n)}">
      <circle cx="${cl.x.toFixed(1)}" cy="${cl.y.toFixed(1)}" r="${CR}" class="et-cl-bg"></circle>
      <circle cx="${cl.x.toFixed(1)}" cy="${cl.y.toFixed(1)}" r="${CR - 8}" class="et-cl-bg2"></circle>
      <text x="${cl.x.toFixed(1)}" y="${(cl.y - CR - 5).toFixed(1)}" class="et-cl-n">${esc(cl.n)}</text>
      ${cl.sub.map(sub => `<text x="${sub.x.toFixed(1)}" y="${(sub.y - 3).toFixed(1)}" class="et-sub-n"><tspan>${esc(sub[0])}</tspan><tspan x="${sub.x.toFixed(1)}" dy="5.5" class="et-sub-k">${sub[1]} for · ${sub[2]} against</tspan></text>`).join('')}
    </g>`).join('');
  const pts = PTS.map((p, i) => {
    const mine = p.frag != null;
    const shape = p.pol === 'pos'
      ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${mine ? 3.4 : 2.2}"></circle>`
      : `<path d="M${(p.x-2.2).toFixed(1)},${(p.y-2.2).toFixed(1)}l4.4,4.4m0,-4.4l-4.4,4.4"></path>`;
    return `<g class="et-pt ${p.pol} ${mine ? 'mine' : ''} ${mine && s.lit > p.frag ? 'is-lit' : ''} ${s.cur === p.frag && mine ? 'is-on' : ''}" data-act="pt" data-i="${i}" ${mine ? `data-frag="${p.frag}"` : ''} tabindex="0" role="button" aria-label="${p.pol === 'pos' ? 'For' : 'Against'}: ${esc(p.fn)}">${shape}</g>`;
  }).join('');
  svg.innerHTML = `<g class="et-zoomg">${cls}<g class="et-pts">${pts}</g></g>`;
}
function renderText(d){
  const s = S(d);
  d.querySelector('[data-text]').innerHTML = FRAGS.map((f, i) => `<button class="et-frag ${f.pol} ${s.lit > i ? 'is-lit' : ''} ${s.cur === i ? 'is-on' : ''}" data-act="frag" data-i="${i}">${esc(f.t)}</button>`).join(' ');
  d.querySelector('[data-fns]').innerHTML = FRAGS.slice(0, s.lit).map((f, i) => `<button class="et-fn ${f.pol} ${s.cur === i ? 'is-on' : ''}" data-act="frag" data-i="${i}" style="--c:${CL[f.k].c}" title="${esc(CL[f.k].n)}"><i></i><span>${esc(f.fn)}</span></button>`).join('');
  const pos = FRAGS.slice(0, s.lit).filter(f => f.pol === 'pos').length;
  d.querySelector('[data-score]').textContent = s.lit ? `${pos} of ${s.lit} functions for` : '';
}
function setCur(d, i){ const s = S(d); s.cur = i; renderText(d);
  d.querySelectorAll('.et-pt').forEach(p => p.classList.toggle('is-on', i != null && p.dataset.frag === String(i))); }

/* viewBox animation; a preempted or cancelled animation settles its promise */
function animateVB(d, to, tok, ms = 550){
  const s = S(d); const svg = d.querySelector('[data-map]'); const from = [...s.vb]; const t0 = performance.now();
  s.endVB?.();
  if(reduced() || ms === 0){ s.vb = to; svg.setAttribute('viewBox', to.join(' ')); return Promise.resolve(); }
  return new Promise(res => {
    const fin = () => { if(s.raf) cancelAnimationFrame(s.raf); s.raf = 0; s.endVB = null; tok?.off(fin); res(); };
    s.endVB = fin; tok?.on(fin);
    const step = now => {
      const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3);
      s.vb = from.map((v, i) => v + (to[i] - v) * e); svg.setAttribute('viewBox', s.vb.map(v => v.toFixed(2)).join(' '));
      if(p < 1) s.raf = requestAnimationFrame(step); else fin();
    };
    s.raf = requestAnimationFrame(step);
  });
}
async function zoomTo(d, k, tok){
  const s = S(d); const cl = CL[k]; s.zoom = k; tip(d, null);
  d.querySelector('[data-map]').classList.add('is-zoomed');
  d.querySelectorAll('.et-cl').forEach(g => g.classList.toggle('is-focus', +g.dataset.k === k));
  d.querySelector('[data-act="zoomout"]').hidden = false;
  await animateVB(d, [cl.x - 60, cl.y - 60, 120, 120], tok);
}
async function zoomOut(d, tok){
  const s = S(d); s.zoom = null; tip(d, null);
  d.querySelector('[data-map]').classList.remove('is-zoomed');
  d.querySelectorAll('.et-cl').forEach(g => g.classList.remove('is-focus'));
  d.querySelector('[data-act="zoomout"]').hidden = true;
  await animateVB(d, [0, 0, 300, 300], tok);
}
function tip(d, el){
  const t = d.querySelector('[data-tip]'); if(!el){ t.hidden = true; return; }
  const p = PTS[+el.dataset.i]; const box = d.querySelector('.et-mapbox').getBoundingClientRect(); const r = el.getBoundingClientRect();
  t.innerHTML = `<b class="${p.pol}">${p.pol === 'pos' ? 'for' : 'against'}</b> ${esc(p.fn)}${p.frag != null ? ' <em>this output</em>' : ''}`;
  const x = r.left - box.left + r.width/2, y = r.top - box.top - 6;
  t.classList.toggle('is-below', y < 36);
  t.style.left = Math.min(Math.max(x, 90), box.width - 90) + 'px';
  t.style.top = (y < 36 ? r.bottom - box.top + 6 : y) + 'px';
  t.hidden = false;
}

export default {
  init(d){
    d._et = { lit:0, cur:null, vb:[0,0,300,300], zoom:null, raf:0, endVB:null };
    renderText(d); renderMap(d);
    const box = d.querySelector('.et-mapbox');
    box.addEventListener('pointerover', e => { const p = e.target.closest('.et-pt'); if(p) tip(d, p); });
    box.addEventListener('pointerout', e => { if(e.target.closest('.et-pt')) tip(d, null); });
    box.addEventListener('focusin', e => { const p = e.target.closest('.et-pt'); if(p) tip(d, p); });
    box.addEventListener('focusout', () => tip(d, null));
  },
  async flow(d, tok){
    const s = S(d); const c = cursor(d);
    s.lit = 0; setCur(d, null); renderMap(d);
    if(s.zoom != null) await zoomOut(d, tok);
    await sleep(500, tok);
    for(let i = 0; i < FRAGS.length; i++){
      s.lit = i + 1; setCur(d, i);
      d.querySelector(`.et-pt[data-frag="${i}"]`)?.classList.add('is-lit', 'is-pop');
      await sleep(620, tok);
    }
    await sleep(500, tok);
    setCur(d, null);
    const g = d.querySelector('.et-cl[data-k="2"] .et-cl-bg');
    await c.show(d.querySelector('[data-fns]'), tok); await c.moveTo(g, tok, 600); await c.click(tok);
    await zoomTo(d, 2, tok);
    await sleep(2200, tok);
    const back = d.querySelector('[data-act="zoomout"]');
    await c.moveTo(back, tok, 500); await c.click(tok);
    await zoomOut(d, tok);
    c.hide();
  },
  final(d){ const s = S(d); s.lit = FRAGS.length; renderMap(d); setCur(d, 3); },
  clean(d){ const s = S(d); s.endVB?.(); d.querySelectorAll('.et-pt.mine').forEach(p => p.classList.toggle('is-lit', s.lit > +p.dataset.frag)); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'frag'){ const i = +el.dataset.i; if(s.lit <= i) return; setCur(d, s.cur === i ? null : i);
      if(s.cur != null && s.zoom != null && s.zoom !== FRAGS[i].k) await zoomTo(d, FRAGS[i].k, tok); }
    if(a === 'zoom'){ const k = +el.dataset.k; if(s.zoom === k) await zoomOut(d, tok); else await zoomTo(d, k, tok); }
    if(a === 'zoomout'){ await zoomOut(d, tok); }
    if(a === 'pt'){ const f = el.dataset.frag;
      if(f != null){ if(s.lit > +f) setCur(d, +f); }
      else if(s.zoom == null){ await zoomTo(d, PTS[+el.dataset.i].k, tok); } }
  },
};
