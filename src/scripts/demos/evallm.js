import { sleep, cursor, esc, reduced } from '../flow.js';

/* Two prompts' outputs, split into spans tagged with the criteria they are evidence for. */
const OUT = [
  [ {t:'Plants make their own food.', c:[0,1,3]}, {t:'They take in sunlight, water, and air, and mix them into sugar.', c:[2]}, {t:'That is why they need a sunny spot.', c:[0]} ],
  [ {t:'A little leaf named Pip woke up hungry. "Time to cook!" she said.', c:[0,1,3]}, {t:'She gulped water from her roots and stirred in sunshine', c:[2]}, {t:'until sweet sugar bubbled up.', c:[1,0]} ],
];
const CRIT = [
  { n:'Concept familiarity', s:[9,9], why:'Both build on eating and cooking, which a five-year-old already knows.' },
  { n:'Engagingness', s:[6,10], why:'Prompt 2 gives the leaf a name and a voice. Prompt 1 reads like a definition.' },
  { n:'Scientific accuracy', s:[9,7], why:'Prompt 1 keeps all three inputs straight. Prompt 2 drops the air, and leaves do not gulp.' },
  { n:'Child vocabulary', s:[9,9], why:'Neither uses a word longer than "sunshine".' },
];
const S = d => d._ev;

function renderOut(d){
  d.querySelectorAll('[data-out]').forEach((p, i) => { p.innerHTML = OUT[i].map(s => `<span class="is-in" data-c="${s.c.join(' ')}">${esc(s.t)}</span>`).join(' '); p.classList.add('is-shown'); });
}
function renderRows(d){
  const s = S(d);
  d.querySelector('[data-rows]').innerHTML = `
    <div class="ev-row ev-row-h"><span></span><span class="ev-p1">P1</span><span class="ev-p2">P2</span></div>
    ${CRIT.slice(0, s.n).map((c, i) => `<button class="ev-row ${s.cur === i ? 'is-on' : ''}" data-act="crit" data-c="${i}" style="--i:${i}">
      <span class="ev-cn">${esc(c.n)}</span>
      <span class="ev-sc ${s.scored > i ? cls(c, 0) : 'is-wait'}">${s.scored > i ? c.s[0] : ''}</span>
      <span class="ev-sc ${s.scored > i ? cls(c, 1) : 'is-wait'}">${s.scored > i ? c.s[1] : ''}</span>
    </button>`).join('')}
    ${s.n < CRIT.length ? `<button class="ev-add" data-act="add">+ Add a criterion: <b>${esc(CRIT[s.n].n)}</b></button>` : ''}`;
}
function cls(c, k){ const a = c.s[k], b = c.s[1-k]; return a > b ? 'win' : a < b ? 'lose' : 'tie'; }
function setCur(d, i){
  const s = S(d); s.cur = i;
  d.querySelectorAll('.ev-row[data-c]').forEach(r => r.classList.toggle('is-on', +r.dataset.c === i));
  d.querySelectorAll('.ev-o span[data-c]').forEach(sp => sp.classList.toggle('is-hl', i != null && sp.dataset.c.split(' ').includes(String(i))));
  const why = d.querySelector('[data-why]');
  why.innerHTML = i == null ? '' : `<b>${esc(CRIT[i].n)}.</b> ${esc(CRIT[i].why)}`;
}
async function score(d, i, tok){
  const s = S(d);
  s.cur = null; renderRows(d);
  d.querySelectorAll('.ev-o span[data-c]').forEach(sp => sp.classList.toggle('is-hl', sp.dataset.c.split(' ').includes(String(i))));
  d.querySelector('[data-why]').innerHTML = `<span class="ev-busy">Evaluating ${esc(CRIT[i].n.toLowerCase())}</span>`;
  await sleep(reduced() ? 0 : 850, tok);
  s.scored = Math.max(s.scored, i + 1); renderRows(d); setCur(d, i);
}

export default {
  init(d){ d._ev = { n:3, scored:0, cur:null }; renderOut(d); renderRows(d); },
  async flow(d, tok){
    const c = cursor(d); const s = S(d);
    s.n = 3; s.scored = 0; s.cur = null; renderRows(d); setCur(d, null);
    await sleep(600, tok);
    for(let i = 0; i < 3; i++){ await score(d, i, tok); await sleep(500, tok); }
    await sleep(500, tok);
    const add = d.querySelector('[data-act="add"]');
    await c.show(d.querySelector('[data-why]'), tok); await c.moveTo(add, tok, 500); await c.click(tok);
    s.n = 4; await score(d, 3, tok);
    await sleep(300, tok); c.hide();
  },
  final(d){ const s = S(d); s.n = 4; s.scored = 4; renderRows(d); setCur(d, 1); },
  clean(d){ const s = S(d); if(d.querySelector('.ev-busy')) setCur(d, s.scored ? s.scored - 1 : null); },
  async act(d, el, tok){
    const s = S(d);
    if(el.dataset.act === 'crit'){ const i = +el.dataset.c; if(s.scored > i) setCur(d, i); else await score(d, i, tok); }
    if(el.dataset.act === 'add'){ s.n = Math.min(CRIT.length, s.n + 1); await score(d, s.n - 1, tok); }
  },
};
