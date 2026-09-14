import { sleep, cursor, esc, reduced } from '../flow.js';

/* The response is cut into fragments; each fragment serves a function, rated for or against the criteria.
   Functions from every evaluated output are embedded on a map and clustered. */
const FRAGS = [
  { t:"Einstein's theory of relativity describes how space and time are woven together.", fn:'Explains the core mechanism clearly', k:2, pol:'pos' },
  { t:'The special theory shows that the speed of light is the same for every observer,', fn:'States a key principle accurately', k:3, pol:'pos' },
  { t:'while the general theory explains gravity as the curving of spacetime', fn:'Gives a structured two-part explanation', k:4, pol:'pos' },
  { t:'caused by mass and energy.', fn:'Oversimplifies a technical concept', k:1, pol:'neg' },
  { t:'Think of a bowling ball on a trampoline: heavy objects bend the surface, and smaller ones roll toward them.', fn:'Uses an analogy effectively', k:2, pol:'pos' },
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
const R = 112, C = 160, CR = 42;
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
  const cls = CL.map((cl, k) => `<g class="et-cl" data-act="zoom" data-k="${k}" style="--c:${cl.c}">
      <circle cx="${cl.x.toFixed(1)}" cy="${cl.y.toFixed(1)}" r="${CR}" class="et-cl-bg"></circle>
      <circle cx="${cl.x.toFixed(1)}" cy="${cl.y.toFixed(1)}" r="${CR - 8}" class="et-cl-bg2"></circle>
      <text x="${cl.x.toFixed(1)}" y="${(cl.y - CR - 5).toFixed(1)}" class="et-cl-n">${esc(cl.n)}</text>
      ${cl.sub.map(sub => `<text x="${sub.x.toFixed(1)}" y="${(sub.y - 3).toFixed(1)}" class="et-sub-n"><tspan>${esc(sub[0])}</tspan><tspan x="${sub.x.toFixed(1)}" dy="5.5" class="et-sub-k">${sub[1]} for · ${sub[2]} against</tspan></text>`).join('')}
    </g>`).join('');
  const pts = PTS.map((p, i) => {
    const mine = p.frag != null;
    const shape = p.pol === 'pos'
      ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${mine ? 3.2 : 2}"></circle>`
      : `<path d="M${(p.x-2.2).toFixed(1)},${(p.y-2.2).toFixed(1)}l4.4,4.4m0,-4.4l-4.4,4.4"></path>`;
    return `<g class="et-pt ${p.pol} ${mine ? 'mine' : ''} ${mine && s.lit > p.frag ? 'is-lit' : ''} ${s.cur === p.frag && mine ? 'is-on' : ''}" data-act="pt" data-i="${i}" ${mine ? `data-frag="${p.frag}"` : ''}>${shape}</g>`;
  }).join('');
  svg.innerHTML = `<g class="et-zoomg">${cls}<g class="et-pts">${pts}</g></g>`;
}
function renderText(d){
  const s = S(d);
  d.querySelector('[data-text]').innerHTML = FRAGS.map((f, i) => `<button class="et-frag ${f.pol} ${s.lit > i ? 'is-lit' : ''} ${s.cur === i ? 'is-on' : ''}" data-act="frag" data-i="${i}">${esc(f.t)}</button>`).join(' ');
  d.querySelector('[data-fns]').innerHTML = FRAGS.slice(0, s.lit).map((f, i) => `<button class="et-fn ${f.pol} ${s.cur === i ? 'is-on' : ''}" data-act="frag" data-i="${i}" style="--c:${CL[f.k].c}" title="${esc(CL[f.k].n)}"><i></i><span>${esc(f.fn)}</span></button>`).join('');
  const pos = FRAGS.slice(0, s.lit).filter(f => f.pol === 'pos').length;
  d.querySelector('[data-score]').textContent = s.lit ? `${pos} of ${s.lit} for` : '';
}
function setCur(d, i){ const s = S(d); s.cur = i; renderText(d);
  d.querySelectorAll('.et-pt').forEach(p => p.classList.toggle('is-on', i != null && p.dataset.frag === String(i))); }

/* viewBox animation */
function vb(d){ return S(d).vb; }
function animateVB(d, to, ms = 550){
  const s = S(d); const svg = d.querySelector('[data-map]'); const from = [...s.vb]; const t0 = performance.now();
  if(s.raf) cancelAnimationFrame(s.raf);
  if(reduced() || ms === 0){ s.vb = to; svg.setAttribute('viewBox', to.join(' ')); return Promise.resolve(); }
  return new Promise(res => {
    const step = now => {
      const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3);
      s.vb = from.map((v, i) => v + (to[i] - v) * e); svg.setAttribute('viewBox', s.vb.map(v => v.toFixed(2)).join(' '));
      if(p < 1) s.raf = requestAnimationFrame(step); else { s.raf = 0; res(); }
    };
    s.raf = requestAnimationFrame(step);
  });
}
async function zoomTo(d, k){
  const s = S(d); const cl = CL[k]; s.zoom = k;
  d.querySelector('[data-map]').classList.add('is-zoomed');
  d.querySelectorAll('.et-cl').forEach(g => g.classList.toggle('is-focus', +g.dataset.k === k));
  d.querySelector('[data-act="zoomout"]').hidden = false;
  await animateVB(d, [cl.x - 62, cl.y - 62, 124, 124]);
}
async function zoomOut(d){
  const s = S(d); s.zoom = null;
  d.querySelector('[data-map]').classList.remove('is-zoomed');
  d.querySelectorAll('.et-cl').forEach(g => g.classList.remove('is-focus'));
  d.querySelector('[data-act="zoomout"]').hidden = true;
  await animateVB(d, [0, 0, 320, 320]);
}
function tip(d, el){
  const t = d.querySelector('[data-tip]'); if(!el){ t.hidden = true; return; }
  const p = PTS[+el.dataset.i]; const box = d.querySelector('.et-mapbox').getBoundingClientRect(); const r = el.getBoundingClientRect();
  t.innerHTML = `<b class="${p.pol}">${p.pol === 'pos' ? 'for' : 'against'}</b> ${esc(p.fn)}${p.frag != null ? ' <em>this output</em>' : ''}`;
  t.style.left = (r.left - box.left + r.width/2) + 'px'; t.style.top = (r.top - box.top - 6) + 'px'; t.hidden = false;
}

export default {
  init(d){
    d._et = { lit:0, cur:null, vb:[0,0,320,320], zoom:null, raf:0 };
    renderText(d); renderMap(d);
    const box = d.querySelector('.et-mapbox');
    box.addEventListener('pointerover', e => { const p = e.target.closest('.et-pt'); if(p) tip(d, p); });
    box.addEventListener('pointerout', e => { if(e.target.closest('.et-pt')) tip(d, null); });
  },
  async flow(d, tok){
    const s = S(d); const c = cursor(d);
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
    await zoomTo(d, 2);
    await sleep(2200, tok);
    const back = d.querySelector('[data-act="zoomout"]');
    await c.moveTo(back, tok, 500); await c.click(tok);
    await zoomOut(d);
    c.hide();
  },
  final(d){ const s = S(d); s.lit = FRAGS.length; renderMap(d); setCur(d, 4); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'frag'){ const i = +el.dataset.i; if(s.lit <= i) return; setCur(d, s.cur === i ? null : i);
      if(s.cur != null && s.zoom != null && s.zoom !== FRAGS[i].k) await zoomTo(d, FRAGS[i].k); }
    if(a === 'zoom'){ const k = +el.dataset.k; if(s.zoom === k) await zoomOut(d); else await zoomTo(d, k); }
    if(a === 'zoomout'){ await zoomOut(d); }
    if(a === 'pt'){ const f = el.dataset.frag; if(f != null){ setCur(d, +f); } else if(s.zoom == null){ await zoomTo(d, PTS[+el.dataset.i].k); } }
  },
};
