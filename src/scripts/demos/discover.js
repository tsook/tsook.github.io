import { sleep, typeInto, stream, esc, reduced } from '../flow.js';

/* The intent hierarchy from the paper's opening figure. Two nodes are known at the start. */
const NODES = [
  { id:'animal', t:'Includes an animal', depth:0, start:true },
  { id:'pet', t:'Includes a pet', depth:1 },
  { id:'cat', t:'Includes a cat', depth:2 },
  { id:'tabby', t:'Includes a tabby cat', depth:3 },
  { id:'indoors', t:'Pet is indoors', depth:1 },
  { id:'sofa', t:'Pet is sleeping on a sofa indoors', depth:2 },
  { id:'structure', t:'Poem structure', depth:0, start:true },
  { id:'three', t:'Three-line poem structure', depth:1 },
];
const U0 = 'write me a poem about an animal';
const BRANCH = {
  dl: [
    { who:'user', t:U0 },
    { who:'ai', t:'Here are first lines for a few options. <b>1) The Dog:</b> The dog waits where the day comes home… <b>2) The Fox:</b> The fox stitches the hedge at dusk… Which feels closer?', found:['pet','indoors'], len:0.1 },
    { who:'user', t:'the dog one. something about a pet at home' },
    { who:'ai', t:'Two ways in. <b>A)</b> The dog asleep by the door, one ear up for the car. <b>B)</b> A cat on the sofa, refusing to wake for anyone.', found:['cat','sofa'], len:0.1 },
    { who:'user', t:'B, the cat on the sofa. keep it short' },
    { who:'ai', t:'Three lines, then: <i>The tabby sleeps where the sun lands last, / one ear turned toward the kettle, / the sofa keeping her shape.</i>', found:['tabby','three'], len:0 },
  ],
  base: [
    { who:'user', t:U0 },
    { who:'ai', t:'Here is a poem about an animal: <i>The eagle rides the morning air, / above the ridge, above the pines, / it circles once and does not care / how far the valley falls…</i> (14 lines)', found:[], len:0.4 },
    { who:'user', t:'hmm, not really what I had in mind. can it be different?' },
    { who:'ai', t:'Of course! Here is a revised version with more vivid imagery: <i>The eagle climbs the golden dawn, / its wings a blade against the light…</i> (14 lines)', found:[], len:0.4 },
    { who:'user', t:'closer maybe? i\'m not sure what to change' },
    { who:'ai', t:'No problem! Here is another take with a gentler tone: <i>Soft above the sleeping hills, / the eagle drifts on quiet air…</i> (12 lines)', found:[], len:0.3 },
  ],
};
const S = d => d._dl;

function found(d){ const s = S(d); const set = new Set(NODES.filter(n => n.start).map(n => n.id)); BRANCH[s.mode].slice(0, s.turn + 1).forEach(t => (t.found || []).forEach(id => set.add(id))); return set; }
function renderTree(d){
  const s = S(d); const f = found(d); const last = new Set(BRANCH[s.mode][s.turn]?.found || []);
  d.querySelector('[data-tree]').innerHTML = NODES.map(n => `<span class="dl-node d${n.depth} ${f.has(n.id) ? (last.has(n.id) ? 'new' : 'found') : ''}" style="--d:${n.depth}">${esc(n.t)}</span>`).join('');
  d.querySelector('[data-bar]').innerHTML = NODES.map(n => `<i class="${f.has(n.id) ? (last.has(n.id) ? 'new' : 'on') : ''}"></i>`).join('');
  d.querySelector('[data-progk]').textContent = `${f.size} of ${NODES.length}`;
}
function turnHTML(t, i){
  const r = t.who === 'ai' ? `<span class="dl-r ${t.found.length ? 'plus' : ''}" title="discovery reward minus length penalty">R ${t.found.length ? '+' + t.found.length : '0'}${t.len ? `<small>−${t.len.toFixed(1)}</small>` : ''}</span>` : '';
  return `<div class="dl-turn ${t.who}" data-i="${i}"><span class="dl-who">${t.who === 'ai' ? 'AI' : 'User'}</span><span class="dl-tx" data-tx></span>${r}</div>`;
}
async function showTurn(d, i, tok, animate){
  const s = S(d); const t = BRANCH[s.mode][i]; const box = d.querySelector('[data-turns]');
  box.insertAdjacentHTML('beforeend', turnHTML(t, i));
  const el = box.lastElementChild; const tx = el.querySelector('[data-tx]');
  requestAnimationFrame(() => el.classList.add('is-in'));
  s.turn = i;
  if(!animate || reduced()){ tx.innerHTML = t.t; }
  else if(t.who === 'user'){ await typeInto(tx, t.t, tok, 40); }
  else { const plain = t.t.replace(/<[^>]+>/g, ''); await stream(tx, plain, tok, 26); tx.innerHTML = t.t; }
  el.classList.add('is-done');
  renderTree(d);
  box.scrollTop = box.scrollHeight;
  d.querySelector('[data-act="next"]').disabled = i >= BRANCH[s.mode].length - 1;
}
function reset(d, mode){
  const s = S(d); s.mode = mode; s.turn = -1;
  d.querySelectorAll('[data-act="mode"]').forEach(b => b.classList.toggle('is-on', b.dataset.mode === mode));
  d.querySelector('[data-turns]').innerHTML = '';
  d.querySelector('[data-act="next"]').disabled = false;
  showTurn(d, 0, null, false);
}
async function play(d, tok, from = 1){
  const s = S(d);
  for(let i = from; i < BRANCH[s.mode].length; i++){ await showTurn(d, i, tok, true); await sleep(i % 2 ? 900 : 500, tok); }
}

export default {
  init(d){ d._dl = { mode:'dl', turn:-1 }; reset(d, 'dl'); },
  async flow(d, tok){ reset(d, 'dl'); await sleep(400, tok); await play(d, tok); },
  final(d){ reset(d, 'dl'); for(let i = 1; i < BRANCH.dl.length; i++) showTurn(d, i, null, false); },
  async act(d, el, tok){
    const s = S(d); const a = el.dataset.act;
    if(a === 'mode'){ reset(d, el.dataset.mode); await play(d, tok); }
    if(a === 'next'){ if(s.turn < BRANCH[s.mode].length - 1) await showTurn(d, s.turn + 1, tok, !reduced()); }
  },
};
