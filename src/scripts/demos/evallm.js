import { sleep, cursor, esc, reduced } from '../flow.js';

/* Two prompts' outputs, split into spans tagged with the criteria they are evidence for.
   Criteria are added one at a time; each one lights up its evidence and scores both outputs. */
const OUT = [
  [ {t:'Plants make their own food.', c:[0,1,3]}, {t:'They mix sunlight, water, and air into sugar.', c:[2]} ],
  [ {t:'A leaf named Pip woke up hungry. "Time to cook!"', c:[0,1,3]}, {t:'She gulped water from her roots and stirred in sunshine.', c:[2,1]} ],
];
const CRIT = [
  { n:'Concept familiarity', s:[9,9], why:'Both build on eating and cooking, which a five-year-old already knows.' },
  { n:'Engagingness', s:[6,10], why:'Prompt 2 gives the leaf a name and a voice. Prompt 1 reads like a definition.' },
  { n:'Scientific accuracy', s:[9,7], why:'Prompt 1 keeps all three inputs. Prompt 2 drops the air, and leaves do not gulp.' },
  { n:'Child vocabulary', s:[9,9], why:'Neither uses a word longer than "sunshine".' },
];
const S = d => d._ev;
const cls = (c, k) => { const a = c.s[k], b = c.s[1-k]; return a > b ? 'win' : a < b ? 'lose' : 'tie'; };

function renderOut(d){
  d.querySelectorAll('[data-out]').forEach((p, i) => { p.innerHTML = OUT[i].map(s => `<span data-c="${s.c.join(' ')}">${esc(s.t)}</span>`).join(' '); });
}
function render(d){
  const s = S(d);
  d.querySelector('[data-rows]').innerHTML = s.added.map(i => { const c = CRIT[i]; const done = s.scored.has(i); return `<button class="ev-row ${s.cur === i ? 'is-on' : ''}" data-act="crit" data-c="${i}">
      <span class="ev-cn">${esc(c.n)}</span>
      <span class="ev-sc ${done ? cls(c, 0) : 'is-wait'}" title="Prompt 1">${done ? c.s[0] : ''}</span>
      <span class="ev-sc ${done ? cls(c, 1) : 'is-wait'}" title="Prompt 2">${done ? c.s[1] : ''}</span>
    </button>`; }).join('');
  d.querySelector('[data-sugg]').innerHTML = CRIT.map((c, i) => s.added.includes(i) ? '' : `<button class="chip" data-act="sugg" data-c="${i}">${esc(c.n)}</button>`).join('');
}
function highlight(d, i, pop){
  d.querySelectorAll('.ev-o span[data-c]').forEach(sp => {
    const on = i != null && sp.dataset.c.split(' ').includes(String(i));
    sp.classList.toggle('is-hl', on);
    if(on && pop){ sp.classList.remove('is-pop'); void sp.offsetWidth; sp.classList.add('is-pop'); }
  });
}
function setCur(d, i){
  const s = S(d); s.cur = i; render(d); highlight(d, i, false);
  d.querySelector('[data-why]').innerHTML = i == null ? '' : `<b>${esc(CRIT[i].n)}.</b> ${esc(CRIT[i].why)}`;
}
async function add(d, i, tok){
  const s = S(d); if(s.added.includes(i)) { setCur(d, i); return; }
  s.added.push(i); s.cur = i; render(d);
  d.querySelector('[data-in]').value = '';
  d.querySelector('[data-why]').innerHTML = `<span class="ev-busy">Evaluating ${esc(CRIT[i].n.toLowerCase())}</span>`;
  highlight(d, i, true);
  await sleep(reduced() ? 0 : 900, tok);
  s.scored.add(i); setCur(d, i);
}
function match(text){
  const q = text.trim().toLowerCase(); if(!q) return -1;
  let i = CRIT.findIndex(c => c.n.toLowerCase() === q); if(i >= 0) return i;
  i = CRIT.findIndex(c => c.n.toLowerCase().includes(q) || q.includes(c.n.toLowerCase().split(' ')[0])); return i;
}
async function typeValue(input, text, tok){
  input.value = ''; input.classList.add('is-typing');
  if(reduced()){ input.value = text; input.classList.remove('is-typing'); return; }
  try { for(let k = 1; k <= text.length; k++){ input.value = text.slice(0, k); await sleep(38, tok); } }
  finally { input.value = text; input.classList.remove('is-typing'); }
}

export default {
  init(d){
    d._ev = { added:[], scored:new Set(), cur:null };
    renderOut(d); render(d);
    d.querySelector('[data-form]').addEventListener('submit', e => { e.preventDefault(); d.querySelector('[data-act="go"]').click(); });
  },
  async flow(d, tok){
    const c = cursor(d); const s = S(d);
    s.added = []; s.scored = new Set(); s.cur = null; render(d); highlight(d, null); d.querySelector('[data-why]').innerHTML = '';
    const input = d.querySelector('[data-in]'); const go = d.querySelector('[data-act="go"]');
    await sleep(500, tok);
    await c.show(d.querySelector('.ev-outs'), tok);
    for(const name of ['Engagingness', 'Scientific accuracy']){
      await c.moveTo(input, tok, 500); await c.click(tok);
      await typeValue(input, name, tok);
      await c.moveTo(go, tok, 300); await c.click(tok);
      await add(d, match(name), tok);
      await sleep(900, tok);
    }
    const chip = d.querySelector('[data-act="sugg"][data-c="3"]');
    if(chip){ await c.moveTo(chip, tok, 500); await c.click(tok); await add(d, 3, tok); }
    await sleep(300, tok); c.hide();
  },
  final(d){ const s = S(d); s.added = [1, 2, 3]; s.scored = new Set([1, 2, 3]); setCur(d, 1); },
  clean(d){ const s = S(d); const busy = d.querySelector('.ev-busy'); if(busy){ s.added.forEach(i => s.scored.add(i)); setCur(d, s.cur); } d.querySelector('[data-in]')?.classList.remove('is-typing'); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'crit'){ const i = +el.dataset.c; if(s.scored.has(i)) setCur(d, i); else await add(d, i, tok); }
    if(a === 'sugg'){ await add(d, +el.dataset.c, tok); }
    if(a === 'go'){
      const input = d.querySelector('[data-in]'); const i = match(input.value);
      if(i < 0){ input.classList.remove('is-shake'); void input.offsetWidth; input.classList.add('is-shake'); d.querySelector('[data-why]').innerHTML = `<span class="ev-hint">This walkthrough only knows the four criteria below. Pick one.</span>`; return; }
      await add(d, i, tok);
    }
  },
};
