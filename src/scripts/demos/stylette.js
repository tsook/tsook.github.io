import { sleep, stream, cursor, esc, reduced } from '../flow.js';

/* Each request names the element it targets and the properties Stylette infers for it.
   The palette follows the paper: one group per property with the current value and candidates. */
const REQ = [
  { el:'p', text:'tone down the text', cols:[
    { verb:'Change', prop:'color', css:'color', cur:['#141414','141414'], kind:'color', sug:[['#6E6E68','6E6E68'],['#8C8C85','8C8C85'],['#4B4B46','4B4B46']] },
    { verb:'Change', prop:'font-family', css:'fontFamily', cur:['Geist','Geist'], kind:'font', sug:[['Georgia, serif','Georgia'],['Palatino, "Book Antiqua", serif','Palatino'],['"Helvetica Neue", Arial, sans-serif','Helvetica']] },
    { verb:'Decrease', prop:'font-size', css:'fontSize', cur:['12px','12px'], kind:'size', sug:[['11px','11px'],['10.5px','10.5px'],['10px','10px']] },
  ]},
  { el:'h', text:'make the heading pop', cols:[
    { verb:'Increase', prop:'font-size', css:'fontSize', cur:['19px','19px'], kind:'size', sug:[['22px','22px'],['25px','25px'],['28px','28px']] },
    { verb:'Change', prop:'color', css:'color', cur:['#141414','141414'], kind:'color', sug:[['#1F56D9','1F56D9'],['#C2410C','C2410C'],['#0F766E','0F766E']] },
    { verb:'Change', prop:'font-weight', css:'fontWeight', cur:['600','600'], kind:'weight', sug:[['700','700'],['800','800'],['900','900']] },
  ]},
  { el:'b', text:'make the button friendlier', cols:[
    { verb:'Change', prop:'background', css:'background', cur:['#141414','141414'], kind:'color', sug:[['#1F56D9','1F56D9'],['#2E7D32','2E7D32'],['#E58A2B','E58A2B']] },
    { verb:'Increase', prop:'border-radius', css:'borderRadius', cur:['4px','4px'], kind:'radius', sug:[['10px','10px'],['16px','16px'],['999px','pill']] },
    { verb:'Increase', prop:'padding', css:'padding', cur:['5px 11px','5 · 11'], kind:'pad', sug:[['7px 14px','7 · 14'],['9px 18px','9 · 18'],['11px 22px','11 · 22']] },
  ]},
];
const EL_NAME = { p:'paragraph', h:'heading', b:'button' };

function sugLabel(col, [v, l]){
  if(col.kind === 'color') return `<i class="st-sw" style="--c:${esc(v)}"></i>${esc(l)}`;
  if(col.kind === 'font') return `<span style="font-family:${esc(v)}">${esc(l)}</span>`;
  if(col.kind === 'weight') return `<span style="font-weight:${esc(v)}">Aa ${esc(l)}</span>`;
  return esc(l);
}
function renderCols(d, req){
  d.querySelector('[data-cols]').innerHTML = req.cols.map((c, i) => `
    <div class="st-col" data-col="${i}" style="--i:${i}">
      <div class="st-col-h">${esc(c.verb)} <b>${esc(c.prop)}</b><span class="st-cur"><span>current</span>${sugLabel(c, c.cur)}</span></div>
      <div class="st-sugs">${c.sug.map(s => `<button class="st-sug" data-act="sug" data-col="${i}" data-v="${esc(s[0])}">${sugLabel(c, s)}</button>`).join('')}</div>
    </div>`).join('');
}
function select(d, elKey){ d.querySelectorAll('.st-el').forEach(e => e.classList.toggle('is-sel', e.dataset.el === elKey)); }
function apply(d, btn){
  const req = REQ[d._st.req]; const col = req.cols[+btn.dataset.col];
  const target = d.querySelector(`[data-el="${req.el}"]`);
  const was = btn.classList.contains('is-on');
  const colEl = btn.closest('.st-col');
  colEl.querySelectorAll('.st-sug').forEach(b => b.classList.remove('is-on'));
  if(was) target.style[col.css] = ''; else { target.style[col.css] = btn.dataset.v; btn.classList.add('is-on'); }
  const cur = colEl.querySelector('.st-cur');
  if(cur){ const val = was ? col.cur : col.sug.find(x => x[0] === btn.dataset.v) || col.cur; cur.innerHTML = `<span>${was ? 'current' : 'applied'}</span>${sugLabel(col, val)}`; }
}
function resetStyles(d){ d.querySelectorAll('.st-el').forEach(e => e.removeAttribute('style')); }

/* Speak a request: the mic listens (waveform), words arrive as they are recognized, then the palette. */
async function speak(d, i, tok, animate = true){
  const req = REQ[i]; d._st.req = i; const run = ++d._st.run; const live = () => d._st.run === run;
  const status = d.querySelector('[data-status]'); const mic = d.querySelector('[data-act="mic"]'); const mt = d.querySelector('[data-mic-text]');
  const cols = d.querySelector('[data-cols]');
  d.querySelectorAll('[data-reqs] button').forEach(b => b.classList.toggle('is-on', +b.dataset.req === i));
  resetStyles(d); select(d, req.el);
  cols.classList.remove('is-in'); cols.innerHTML = '';
  mic.classList.add('is-listening'); mic.classList.remove('is-heard'); status.textContent = 'Listening…';
  if(animate){ mt.textContent = ''; await sleep(500, tok); await stream(mt, req.text, tok, 5); } else mt.textContent = req.text;
  if(!live()) return;
  mic.classList.remove('is-listening'); mic.classList.add('is-heard');
  status.textContent = 'Finding properties for the ' + EL_NAME[req.el] + '…'; status.classList.add('is-busy');
  await sleep(animate ? 800 : 0, tok);
  if(!live()) return;
  status.classList.remove('is-busy'); status.textContent = `${req.cols.length} properties to try`;
  renderCols(d, req);
  requestAnimationFrame(() => cols.classList.add('is-in'));
  await sleep(animate ? 500 : 0, tok);
}

export default {
  init(d){
    d._st = { req: 0, run: 0 };
    d.querySelector('[data-reqs]').innerHTML = REQ.map((r, i) => `<button class="chip" data-act="req" data-req="${i}">${esc(r.text)}</button>`).join('');
  },
  async flow(d, tok){
    const c = cursor(d);
    await sleep(500, tok);
    const p = d.querySelector('[data-el="p"]'); const mic = d.querySelector('[data-act="mic"]');
    await c.show(d.querySelector('.st-nav'), tok);
    await c.moveTo(p, tok, 600); await c.click(tok);
    select(d, 'p');
    await c.moveTo(mic, tok, 500); await c.click(tok);
    await speak(d, 0, tok);
    const pick = async sel => { const b = d.querySelector(sel); await c.moveTo(b, tok); await c.click(tok); apply(d, b); };
    await pick('[data-col="0"] .st-sug:nth-of-type(2)');
    await sleep(600, tok);
    await pick('[data-col="2"] .st-sug:nth-of-type(1)');
    await sleep(500, tok);
    c.hide();
    d.querySelector('[data-try]').classList.add('is-shown');
  },
  final(d){ speak(d, 0, null, false); d.querySelector('[data-try]').classList.add('is-shown'); },
  clean(d){
    d.querySelector('[data-try]').classList.add('is-shown');
    const st = d.querySelector('[data-status]'); if(st.classList.contains('is-busy') || /…$/.test(st.textContent)) st.textContent = 'Select an element and speak.';
    if(!d.querySelector('.st-col')) speak(d, d._st.req, null, false);
  },
  async act(d, el, tok){
    if(el.dataset.act === 'sug') apply(d, el);
    if(el.dataset.act === 'req') await speak(d, +el.dataset.req, tok, !reduced());
    if(el.dataset.act === 'mic') await speak(d, (d._st.req + 1) % REQ.length, tok, !reduced());
  },
};
