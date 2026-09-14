import { sleep, typeInto, stream, esc, reduced } from '../flow.js';

/* Two possible current requests. Each shares a context factor with one earlier session,
   so a different earlier preference applies. */
const REQ = [
  { chip:'PBS Nature segment', text:'Write a treatment for a PBS Nature segment on urban orchid mantises.', rel:1,
    ctx:'Session 7, same channel (PBS Nature)', pref:'Observational detail only, no artificial drama.',
    resp:'Open on a balcony orchid at dawn. The mantis holds its pose for eleven minutes; we count them with her. No chase, no music sting.' },
  { chip:'Canon MP-E shoot', text:'Plan a macro shoot of beetle wing scales with my Canon MP-E.', rel:0,
    ctx:'Session 1, same equipment (Canon MP-E)', pref:'Technical specifications first, then creative suggestions.',
    resp:'Setup first: MP-E at 3×, f/8, twin flash at 1/4 power, 40 µm rail steps, 60 frames per stack. Then three compositions: edge-on, oblique, full grid.' },
];
const VERDICT = [['no shared context', 'same equipment'], ['no shared context', 'same channel']];
const S = d => d._cu;

function clear(d){
  d.querySelectorAll('.cu-step').forEach(s => s.classList.remove('is-in'));
  d.querySelectorAll('[data-verdict]').forEach(v => { v.textContent = ''; v.className = 'cu-verdict'; });
  d.querySelectorAll('.cu-sess').forEach(s => s.classList.remove('is-scan', 'is-rel', 'is-irrel'));
  d.querySelector('[data-ctx]').textContent = ''; d.querySelector('[data-pref]').textContent = ''; d.querySelector('[data-resp]').textContent = '';
}
function showReq(d, i){
  const r = REQ[i]; S(d).req = i;
  d.querySelectorAll('[data-reqs] button').forEach(b => b.classList.toggle('is-on', +b.dataset.req === i));
  d.querySelector('[data-req]').textContent = r.text;
}
async function infer(d, i, tok, animate = true, type = animate){
  const r = REQ[i]; const s = S(d); s.req = i; const run = ++s.run; const live = () => s.run === run;
  d.querySelectorAll('[data-reqs] button').forEach(b => b.classList.toggle('is-on', +b.dataset.req === i));
  clear(d);
  const req = d.querySelector('[data-req]');
  if(type) await typeInto(req, r.text, tok, 44); else req.textContent = r.text;
  await sleep(animate ? 400 : 0, tok); if(!live()) return;
  for(const k of [0, 1]){
    const sess = d.querySelector(`.cu-sess[data-s="${k}"]`); const v = d.querySelector(`[data-verdict="${k}"]`);
    sess.classList.add('is-scan'); await sleep(animate ? 520 : 0, tok); sess.classList.remove('is-scan'); if(!live()) return;
    const rel = r.rel === k; sess.classList.add(rel ? 'is-rel' : 'is-irrel');
    v.textContent = VERDICT[k][rel ? 1 : 0]; v.classList.add(rel ? 'yes' : 'no');
    await sleep(animate ? 200 : 0, tok); if(!live()) return;
  }
  const step = k => d.querySelector(`[data-step="${k}"]`);
  step('ctx').classList.add('is-in'); d.querySelector('[data-ctx]').textContent = r.ctx;
  await sleep(animate ? 600 : 0, tok); if(!live()) return;
  step('pref').classList.add('is-in'); step('pref').dataset.tone = r.rel === 0 ? 'blue' : 'violet'; d.querySelector('[data-pref]').textContent = r.pref;
  await sleep(animate ? 700 : 0, tok); if(!live()) return;
  step('resp').classList.add('is-in');
  if(animate) await stream(d.querySelector('[data-resp]'), r.resp, tok, 20); else d.querySelector('[data-resp]').textContent = r.resp;
}

export default {
  init(d){
    d._cu = { req:0, run:0 };
    d.querySelector('[data-reqs]').innerHTML = REQ.map((r, i) => `<button class="chip" data-act="req" data-req="${i}">${esc(r.chip)}</button>`).join('');
    clear(d); showReq(d, 0);
  },
  async flow(d, tok){ await sleep(500, tok); await infer(d, 0, tok, true, false); },
  final(d){ infer(d, 0, null, false); },
  clean(d){ const s = S(d); if(!d.querySelector('[data-step="resp"]').classList.contains('is-in')) infer(d, s.req, null, false); },
  async act(d, el, tok){
    if(el.dataset.act === 'req') await infer(d, +el.dataset.req, tok, !reduced());
    if(el.dataset.act === 'sess') el.classList.toggle('is-open');
  },
};
