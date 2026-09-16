import { sleep, stream, esc, reduced } from '../flow.js';

/* Earlier sessions each carry a context factor and the preference the user showed under it.
   A new request shares a factor with one of them; the model must find it and honor that preference. */
const SESS = [
  { sn:'S1', factor:'Canon MP-E', cls:'f-blue', tone:'blue', pref:'Specs before ideas' },
  { sn:'S4', factor:'Instagram reel', cls:'f-teal', tone:'teal', pref:'Short and punchy' },
  { sn:'S7', factor:'PBS Nature', cls:'f-violet', tone:'violet', pref:'No added drama' },
];
const REQ = [
  { chip:'PBS segment', rel:2, text:'A segment on urban orchid mantises.', resp:'Opens on the mantis holding still for eleven minutes. No chase, no music sting.' },
  { chip:'Canon shoot', rel:0, text:'A macro shoot of beetle wing scales.', resp:'MP-E at 3×, f/8, twin flash at 1/4, 40 µm steps. Then three compositions.' },
  { chip:'Instagram reel', rel:1, text:'A reel from the ant footage.', resp:'Fifteen seconds, three cuts, one line on screen: they carry fifty times their weight.' },
];
const S = d => d._cu;

function renderSessions(d){
  d.querySelector('[data-sessions]').innerHTML = SESS.map((s, i) => `<div class="cu-s" data-s="${i}">
    <span class="cu-sn">${s.sn}</span><mark class="${s.cls}">${esc(s.factor)}</mark><span class="cu-pref">${esc(s.pref)}</span><i class="cu-verdict" data-verdict="${i}"></i></div>`).join('');
}
function link(d, i){
  const svg = d.querySelector('.cu-link'); if(i == null){ svg.innerHTML = ''; return; }
  const b = d.getBoundingClientRect();
  const from = d.querySelector('[data-req-mark]').getBoundingClientRect(); const to = d.querySelector(`.cu-s[data-s="${i}"] mark`).getBoundingClientRect();
  const x1 = from.left - b.left + from.width/2, y1 = from.top - b.top, x2 = to.left - b.left + to.width/2, y2 = to.bottom - b.top;
  const my = (y1 + y2) / 2;
  svg.innerHTML = `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" class="on"></path>`;
}
function clear(d){
  d.querySelectorAll('.cu-step').forEach(s => s.classList.remove('is-in'));
  d.querySelectorAll('.cu-s').forEach(s => { s.classList.remove('is-scan', 'is-rel', 'is-irrel'); });
  d.querySelectorAll('.cu-verdict').forEach(v => { v.className = 'cu-verdict'; });
  ['ctx', 'pref', 'resp'].forEach(k => { d.querySelector(`[data-${k}]`).textContent = ''; });
  link(d, null);
}
function showReq(d, i){
  const r = REQ[i]; S(d).req = i; const s = SESS[r.rel];
  d.querySelectorAll('[data-reqs] button').forEach(b => b.classList.toggle('is-on', +b.dataset.req === i));
  const m = d.querySelector('[data-req-mark]'); m.textContent = s.factor; m.className = s.cls;
  d.querySelector('[data-req]').textContent = r.text;
}
async function infer(d, i, tok, animate = true){
  const r = REQ[i]; const s = S(d); const run = ++s.run; const live = () => s.run === run;
  clear(d); showReq(d, i);
  await sleep(animate ? 500 : 0, tok); if(!live()) return;
  for(let k = 0; k < SESS.length; k++){
    const card = d.querySelector(`.cu-s[data-s="${k}"]`); const v = d.querySelector(`[data-verdict="${k}"]`);
    card.classList.add('is-scan'); await sleep(animate ? 420 : 0, tok); if(!live()) return; card.classList.remove('is-scan');
    const rel = r.rel === k; card.classList.add(rel ? 'is-rel' : 'is-irrel'); v.classList.add(rel ? 'yes' : 'no');
    await sleep(animate ? 120 : 0, tok); if(!live()) return;
  }
  link(d, r.rel);
  const step = k => d.querySelector(`[data-step="${k}"]`); const sess = SESS[r.rel];
  step('ctx').classList.add('is-in'); d.querySelector('[data-ctx]').innerHTML = `${esc(sess.sn)} <mark class="${sess.cls}">${esc(sess.factor)}</mark>`;
  await sleep(animate ? 500 : 0, tok); if(!live()) return;
  step('pref').classList.add('is-in'); step('pref').dataset.tone = sess.tone; d.querySelector('[data-pref]').textContent = sess.pref;
  await sleep(animate ? 600 : 0, tok); if(!live()) return;
  step('resp').classList.add('is-in');
  if(animate) await stream(d.querySelector('[data-resp]'), r.resp, tok, 18); else d.querySelector('[data-resp]').textContent = r.resp;
}

export default {
  init(d){
    d._cu = { req:0, run:0 };
    renderSessions(d);
    d.querySelector('[data-reqs]').innerHTML = REQ.map((r, i) => `<button class="chip" data-act="req" data-req="${i}">${esc(r.chip)}</button>`).join('');
    clear(d); showReq(d, 0);
    let raf = 0; window.addEventListener('resize', () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; const s = S(d); if(d.querySelector('.cu-s.is-rel')) link(d, REQ[s.req].rel); }); });
  },
  async flow(d, tok){ await sleep(500, tok); await infer(d, 0, tok, true); },
  final(d){ infer(d, 0, null, false); },
  clean(d){ const s = S(d); if(!d.querySelector('[data-step="resp"]').classList.contains('is-in')) infer(d, s.req, null, false); },
  async act(d, el, tok){
    if(el.dataset.act === 'req') await infer(d, +el.dataset.req, tok, !reduced());
  },
};
