import { sleep, cursor, esc, reduced } from '../flow.js';

/* Cells are blocks of text. Dragging them into the chain assembles the prompt; the generator
   continues it; the lens shows the outputs. Outputs are keyed by the last cell in the chain. */
const CELLS = ['Icy fingers grabbed my arm in the dark.', 'I jerked away.', 'The hand grabbed again.', 'Nothing was there.'];
const OUT = [
  [ [ {t:'I could not see who they belonged to.', x:.30, y:.42}, {t:'They were colder than the air.', x:.22, y:.30}, {t:'A voice said my name, very close.', x:.52, y:.50} ],
    [ {t:'They knew the shape of my sleeve.', x:.40, y:.78}, {t:'The night held its breath with me.', x:.26, y:.68}, {t:'I decided, absurdly, to say hello.', x:.58, y:.62} ] ],
  [ [ {t:'Something brushed past my shoulder.', x:.56, y:.36}, {t:'The dark was suddenly too quiet.', x:.34, y:.24}, {t:'I did not wait to find out.', x:.74, y:.30} ],
    [ {t:'My own breath sounded borrowed.', x:.44, y:.74}, {t:'The porch light, far off, blinked twice.', x:.62, y:.58}, {t:'I ran, and the dark ran with me.', x:.84, y:.66} ] ],
  [ [ {t:'"Easy," I muttered, heart in my throat.', x:.62, y:.30}, {t:'I plunged into the snow and flailed.', x:.86, y:.22}, {t:'My elbow met something soft and cold.', x:.58, y:.44} ],
    [ {t:'The dark folded around my wrist like cloth.', x:.48, y:.82}, {t:'Somewhere a door I had not seen swung open.', x:.70, y:.60}, {t:'I laughed, which surprised us both.', x:.36, y:.52} ] ],
  [ [ {t:'I stood still and listened to the dark.', x:.16, y:.34}, {t:'My sleeve was wet where the fingers had been.', x:.30, y:.26}, {t:'"Hello?" The word came back twice.', x:.42, y:.40} ],
    [ {t:'The cold stayed on my skin like a signature.', x:.22, y:.86}, {t:'I counted to thirty before I trusted my legs.', x:.34, y:.18}, {t:'Behind me, the snow remembered a shape.', x:.12, y:.72} ] ],
];
const S = d => d._cg;

function wire(d){
  const svg = d.querySelector('.cg-wires'); if(!svg) return;
  const b = d.getBoundingClientRect();
  const P = r => ({ l:r.left - b.left, r:r.right - b.left, cy:r.top - b.top + r.height/2 });
  const g = P(d.querySelector('[data-gen]').getBoundingClientRect());
  const L = P(d.querySelector('[data-lensbox]').getBoundingClientRect());
  const c = P(d.querySelector('[data-chain]').getBoundingClientRect());
  const on = S(d).chain.length > 0;
  const mx1 = (c.r + g.l) / 2, mx2 = (g.r + L.l) / 2;
  svg.innerHTML = `<path class="${on ? 'on' : ''}" d="M${c.r},${c.cy} C${mx1},${c.cy} ${mx1},${g.cy} ${g.l},${g.cy}"></path><path class="${on ? 'on' : ''} out" d="M${g.r},${g.cy} C${mx2},${g.cy} ${mx2},${L.cy} ${L.l},${L.cy}"></path>`;
}
const cellHTML = (i, where) => `<button class="cg-cell" data-act="cell" data-cell="${i}" data-where="${where}" draggable="false">${esc(CELLS[i])}</button>`;
function renderCells(d){
  const s = S(d);
  d.querySelector('[data-tray]').innerHTML = CELLS.map((_, i) => s.chain.includes(i) ? '' : cellHTML(i, 'tray')).join('');
  d.querySelector('[data-chain]').innerHTML = s.chain.length ? s.chain.map(i => cellHTML(i, 'chain')).join('') : '<span class="cg-empty">Drag cells here</span>';
  wire(d);
}
function outputs(d){ const s = S(d); if(!s.chain.length) return null; return OUT[s.chain[s.chain.length - 1]][s.temp]; }
function renderLens(d){
  const s = S(d); const box = d.querySelector('[data-lensbox]'); const cur = outputs(d);
  if(!cur){ box.innerHTML = '<span class="cg-empty">No outputs yet</span>'; wire(d); return; }
  if(s.view === 'list'){
    box.innerHTML = `<div class="cg-list">${cur.map((o, i) => `<div class="cg-li ${s.shown > i ? 'is-in' : ''}"><i></i><span>${esc(o.t)}</span></div>`).join('')}</div>`;
  } else {
    const all = OUT.flat(2);
    box.innerHTML = `<div class="cg-space">
      <span class="cg-ax cg-ax-x"><em>calm</em><em>frantic</em></span><span class="cg-ax cg-ax-y"><em>literal</em><em>figurative</em></span>
      ${all.map(o => { const on = cur.includes(o); const side = (o.x > .62 ? 'r' : o.x < .28 ? 'l' : '') + (o.y > .78 ? ' t' : ''); return `<button class="cg-pt ${on ? 'is-on' : ''} ${side}" data-act="pt" style="left:${(o.x*100).toFixed(1)}%;top:${((1-o.y)*100).toFixed(1)}%"><span class="cg-tip">${esc(o.t)}</span></button>`; }).join('')}
    </div>`;
  }
  wire(d);
}
async function generate(d, tok){
  const s = S(d); const gen = d.querySelector('[data-gen]'); const st = d.querySelector('[data-genstate]');
  if(!s.chain.length){ s.shown = 0; renderLens(d); return; }
  const run = ++s.run;
  gen.classList.add('is-running'); st.textContent = 'generating';
  d.querySelector('.cg-wires').classList.add('is-flowing');
  await sleep(reduced() ? 0 : 700, tok);
  if(s.run !== run) return;
  gen.classList.remove('is-running'); st.textContent = 'ready'; d.querySelector('.cg-wires').classList.remove('is-flowing');
  s.shown = 0; renderLens(d);
  if(s.view === 'list'){
    for(let i = 0; i < 3; i++){ s.shown = i + 1; d.querySelectorAll('.cg-li')[i]?.classList.add('is-in'); await sleep(reduced() ? 0 : 240, tok); if(s.run !== run) return; }
  } else s.shown = 3;
}
function move(d, i, to){
  const s = S(d);
  if(to === 'chain' && !s.chain.includes(i)) s.chain.push(i);
  if(to === 'tray') s.chain = s.chain.filter(x => x !== i);
  renderCells(d);
}
/* Animated drag for the walkthrough: a ghost of the cell follows the cursor into the zone. */
async function dragAnim(d, c, i, to, tok){
  const cell = d.querySelector(`.cg-cell[data-cell="${i}"]`); const zone = d.querySelector(`[data-zone="${to}"]`);
  if(!cell || !zone) return move(d, i, to);
  await c.moveTo(cell, tok, 450); c.el.classList.add('is-down');
  const b = d.getBoundingClientRect(), r = cell.getBoundingClientRect(), z = zone.getBoundingClientRect();
  const ghost = cell.cloneNode(true); ghost.className = 'cg-cell cg-ghost'; ghost.style.width = r.width + 'px';
  ghost.style.transform = `translate(${r.left - b.left}px, ${r.top - b.top}px)`; d.appendChild(ghost); cell.classList.add('is-lifted'); zone.classList.add('is-over');
  await sleep(30, tok);
  const tx = z.left - b.left + 8, ty = z.top - b.top + z.height - r.height - 8;
  ghost.style.transform = `translate(${tx}px, ${ty}px)`;
  c.el.style.transitionDuration = '450ms'; c.el.style.transform = `translate(${tx + r.width/2}px, ${ty + r.height/2}px)`;
  try { await sleep(reduced() ? 0 : 480, tok); }
  finally { ghost.remove(); cell.classList.remove('is-lifted'); zone.classList.remove('is-over'); c.el.classList.remove('is-down'); }
  move(d, i, to);
}
/* Real drag with the pointer. */
function setupDrag(d){
  let drag = null;
  d.addEventListener('pointerdown', e => {
    const cell = e.target.closest('.cg-cell'); if(!cell || e.button !== 0 || cell.classList.contains('cg-ghost')) return;
    drag = { cell, i: +cell.dataset.cell, x: e.clientX, y: e.clientY, ghost: null, id: e.pointerId };
  });
  d.addEventListener('pointermove', e => {
    if(!drag) return;
    if(!drag.ghost){
      if(Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
      const r = drag.cell.getBoundingClientRect(); const g = drag.cell.cloneNode(true); g.className = 'cg-cell cg-ghost is-live'; g.style.width = r.width + 'px';
      drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(g); drag.ghost = g; drag.cell.classList.add('is-lifted');
      try{ drag.cell.setPointerCapture(drag.id); }catch(_){}
      d.classList.add('is-dragging');
    }
    drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px)`;
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-zone]');
    d.querySelectorAll('[data-zone]').forEach(z => z.classList.toggle('is-over', z === over));
  });
  const end = e => {
    if(!drag) return;
    const s = S(d);
    if(drag.ghost){
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-zone]');
      drag.ghost.remove(); drag.cell.classList.remove('is-lifted'); d.classList.remove('is-dragging');
      d.querySelectorAll('[data-zone]').forEach(z => z.classList.remove('is-over'));
      try{ drag.cell.releasePointerCapture(drag.id); }catch(_){}
      s.suppress = true; setTimeout(() => { s.suppress = false; }, 0);
      if(over && over.dataset.zone !== drag.cell.dataset.where){ move(d, drag.i, over.dataset.zone); d.dispatchEvent(new CustomEvent('cells-changed')); }
    }
    drag = null;
  };
  d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
}
function setTemp(d, i){ S(d).temp = i; d.querySelectorAll('[data-act="temp"]').forEach(b => b.classList.toggle('is-on', +b.dataset.t === i)); }
function setView(d, v){ S(d).view = v; d.querySelectorAll('[data-act="lens"]').forEach(b => b.classList.toggle('is-on', b.dataset.lens === v)); }

export default {
  init(d){
    d._cg = { chain:[], temp:0, view:'list', shown:0, run:0, suppress:false };
    renderCells(d); renderLens(d);
    setupDrag(d);
    d.addEventListener('cells-changed', () => { const el = document.createElement('i'); el.dataset.act = 'regen'; d.querySelector('.cg')?.appendChild(el); el.click(); el.remove(); });
    let raf = 0; const rewire = () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; wire(d); }); };
    window.addEventListener('resize', rewire);
    if(document.fonts) document.fonts.ready.then(rewire);
    requestAnimationFrame(() => wire(d));
  },
  async flow(d, tok){
    const c = cursor(d); const s = S(d);
    s.chain = []; setTemp(d, 0); setView(d, 'list'); renderCells(d); renderLens(d);
    await sleep(400, tok);
    await c.show(d.querySelector('.cg-lab'), tok);
    for(const i of [0, 1, 2]){ await dragAnim(d, c, i, 'chain', tok); await sleep(200, tok); }
    await generate(d, tok);
    await sleep(900, tok);
    await dragAnim(d, c, 2, 'tray', tok); await sleep(150, tok);
    await dragAnim(d, c, 3, 'chain', tok);
    await generate(d, tok);
    await sleep(800, tok);
    const sw = d.querySelector('[data-lens="space"]');
    await c.moveTo(sw, tok, 500); await c.click(tok); setView(d, 'space'); s.shown = 3; renderLens(d);
    await sleep(500, tok);
    c.hide();
  },
  final(d){ const s = S(d); s.chain = [0, 1, 2]; s.shown = 3; renderCells(d); renderLens(d); },
  clean(d){ const s = S(d); d.querySelectorAll('.cg-ghost').forEach(g => g.remove()); d.querySelectorAll('.is-lifted,.is-over').forEach(e => e.classList.remove('is-lifted', 'is-over')); d.querySelector('[data-genstate]').textContent = 'ready'; s.shown = 3; renderCells(d); renderLens(d); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'cell'){ if(s.suppress) return; move(d, +el.dataset.cell, el.dataset.where === 'tray' ? 'chain' : 'tray'); await generate(d, tok); }
    if(a === 'regen'){ await generate(d, tok); }
    if(a === 'temp'){ setTemp(d, +el.dataset.t); await generate(d, tok); }
    if(a === 'lens'){ setView(d, el.dataset.lens); s.shown = 3; renderLens(d); }
    if(a === 'pt'){ el.classList.toggle('is-open'); }
  },
};
