import { sleep, cursor, esc, reduced } from '../flow.js';

/* Outputs for each chain and temperature, with a position in the space lens
   (x: calm to frantic, y: literal to figurative). */
const OUT = [
  [ /* chain 0: The hand grabbed again. */
    [ {t:'"Easy," I muttered, heart in my throat.', x:.62, y:.30}, {t:'I plunged into the snow and flailed.', x:.86, y:.22}, {t:'My elbow met something soft and cold.', x:.58, y:.44} ],
    [ {t:'The dark folded around my wrist like cloth.', x:.48, y:.82}, {t:'Somewhere a door I had not seen swung open.', x:.70, y:.60}, {t:'I laughed, which surprised us both.', x:.36, y:.52} ],
  ],
  [ /* chain 1: Nothing was there. */
    [ {t:'I stood still and listened to the dark.', x:.16, y:.34}, {t:'My sleeve was wet where the fingers had been.', x:.30, y:.26}, {t:'"Hello?" The word came back twice.', x:.42, y:.40} ],
    [ {t:'The cold stayed on my skin like a signature.', x:.22, y:.86}, {t:'I counted to thirty before I trusted my legs.', x:.34, y:.18}, {t:'Behind me, the snow remembered a shape.', x:.12, y:.72} ],
  ],
];
const S = d => d._cg;

function wire(d){
  const svg = d.querySelector('.cg-wires'); if(!svg) return;
  const b = d.getBoundingClientRect();
  const P = r => ({ l:r.left - b.left, r:r.right - b.left, cy:r.top - b.top + r.height/2 });
  const g = P(d.querySelector('[data-gen]').getBoundingClientRect());
  const L = P(d.querySelector('[data-lensbox]').getBoundingClientRect());
  let s = '';
  d.querySelectorAll('.cg-leaf').forEach(ch => {
    const c = P(ch.getBoundingClientRect()); const on = ch.classList.contains('is-linked'); const mx = (c.r + g.l) / 2;
    s += `<path class="${on ? 'on' : ''}" d="M${c.r},${c.cy} C${mx},${c.cy} ${mx},${g.cy} ${g.l},${g.cy}"></path>`;
  });
  const mx = (g.r + L.l) / 2;
  s += `<path class="on out" d="M${g.r},${g.cy} C${mx},${g.cy} ${mx},${L.cy} ${L.l},${L.cy}"></path>`;
  svg.innerHTML = s;
}
function outputs(d){ const s = S(d); return OUT[s.chain][s.temp]; }
function renderLens(d){
  const s = S(d); const box = d.querySelector('[data-lensbox]'); const cur = outputs(d);
  const note = d.querySelector('[data-lensnote]');
  if(s.view === 'list'){
    box.innerHTML = `<div class="cg-list">${cur.map((o, i) => `<div class="cg-li ${s.shown > i ? 'is-in' : ''}" style="--i:${i}"><i></i><span>${esc(o.t)}</span></div>`).join('')}</div>`;
    note.textContent = 'Outputs from the linked chain, as a list.';
  } else {
    const all = OUT.flat(2);
    box.innerHTML = `<div class="cg-space">
      <span class="cg-ax cg-ax-x"><em>calm</em><em>frantic</em></span><span class="cg-ax cg-ax-y"><em>literal</em><em>figurative</em></span>
      ${all.map(o => { const on = cur.includes(o); const side = (o.x > .62 ? 'r' : o.x < .28 ? 'l' : '') + (o.y > .78 ? ' t' : ''); return `<button class="cg-pt ${on ? 'is-on' : ''} ${side}" data-act="pt" style="left:${(o.x*100).toFixed(1)}%;top:${((1-o.y)*100).toFixed(1)}%" aria-label="${esc(o.t)}"><span class="cg-tip">${esc(o.t)}</span></button>`; }).join('')}
    </div>`;
    note.textContent = 'Every output placed on two axes. The linked chain is dark.';
  }
}
async function generate(d, tok){
  const s = S(d); const gen = d.querySelector('[data-gen]'); const st = d.querySelector('[data-genstate]');
  gen.classList.add('is-running'); st.textContent = 'generating';
  d.querySelector('.cg-wires').classList.add('is-flowing');
  await sleep(reduced() ? 0 : 700, tok);
  gen.classList.remove('is-running'); st.textContent = 'idle'; d.querySelector('.cg-wires').classList.remove('is-flowing');
  s.shown = 0; renderLens(d);
  if(s.view === 'list'){
    for(let i = 0; i < 3; i++){ s.shown = i + 1; d.querySelectorAll('.cg-li')[i]?.classList.add('is-in'); await sleep(reduced() ? 0 : 260, tok); }
  } else s.shown = 3;
}
function setChain(d, i){ S(d).chain = i; d.querySelectorAll('.cg-leaf').forEach(c => c.classList.toggle('is-linked', +c.dataset.chain === i)); wire(d); }
function setTemp(d, i){ S(d).temp = i; d.querySelectorAll('[data-act="temp"]').forEach(b => b.classList.toggle('is-on', +b.dataset.t === i)); }
function setView(d, v){ S(d).view = v; d.querySelectorAll('[data-act="lens"]').forEach(b => b.classList.toggle('is-on', b.dataset.lens === v)); }

export default {
  init(d){
    d._cg = { chain:0, temp:0, view:'list', shown:0 };
    setChain(d, 0); renderLens(d);
    requestAnimationFrame(() => wire(d));
    const rewire = () => wire(d);
    window.addEventListener('resize', rewire);
    if(document.fonts) document.fonts.ready.then(rewire);
  },
  async flow(d, tok){
    const c = cursor(d); const s = S(d);
    await sleep(400, tok);
    const leaf0 = d.querySelector('[data-chain="0"]');
    await c.show(d.querySelector('.cg-cells .cg-lab'), tok); await c.moveTo(leaf0, tok, 500); await c.click(tok);
    setChain(d, 0); await generate(d, tok);
    await sleep(900, tok);
    const sw = d.querySelector('[data-lens="space"]');
    await c.moveTo(sw, tok, 600); await c.click(tok); setView(d, 'space'); s.shown = 3; renderLens(d);
    await sleep(1100, tok);
    const leaf1 = d.querySelector('[data-chain="1"]');
    await c.moveTo(leaf1, tok, 600); await c.click(tok); setChain(d, 1); await generate(d, tok);
    await sleep(900, tok);
    const t1 = d.querySelector('[data-t="1"]');
    await c.moveTo(t1, tok, 500); await c.click(tok); setTemp(d, 1); await generate(d, tok);
    await sleep(400, tok);
    c.hide();
  },
  final(d){ const s = S(d); s.shown = 3; setChain(d, 0); renderLens(d); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'chain'){ setChain(d, +el.dataset.chain); await generate(d, tok); }
    if(a === 'temp'){ setTemp(d, +el.dataset.t); await generate(d, tok); }
    if(a === 'lens'){ setView(d, el.dataset.lens); s.shown = 3; renderLens(d); }
    if(a === 'pt'){ el.classList.toggle('is-open'); }
  },
};
