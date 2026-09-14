import { sleep, typeInto, cursor, esc, reduced } from '../flow.js';

/* Each request names the element it targets and the properties Stylette infers for it.
   Suggestions follow the paper's palette: a column per property, with the current value and candidates. */
const REQ = [
  { el:'p', text:'tone down the text', cols:[
    { verb:'Change', prop:'color', css:'color', cur:['#141414','141414'], kind:'color', sug:[['#6E6E68','6E6E68'],['#8C8C85','8C8C85'],['#4B4B46','4B4B46']] },
    { verb:'Change', prop:'font-family', css:'fontFamily', cur:['Geist','Geist'], kind:'font', sug:[['Georgia, serif','Georgia'],['Palatino, "Book Antiqua", serif','Palatino'],['"Helvetica Neue", Arial, sans-serif','Helvetica']] },
    { verb:'Decrease', prop:'font-size', css:'fontSize', cur:['13px','13px'], kind:'size', sug:[['12px','12px'],['11.5px','11.5px'],['11px','11px']] },
  ]},
  { el:'h', text:'make the heading pop', cols:[
    { verb:'Increase', prop:'font-size', css:'fontSize', cur:['22px','22px'], kind:'size', sug:[['26px','26px'],['30px','30px'],['34px','34px']] },
    { verb:'Change', prop:'color', css:'color', cur:['#141414','141414'], kind:'color', sug:[['#1F56D9','1F56D9'],['#C2410C','C2410C'],['#0F766E','0F766E']] },
    { verb:'Change', prop:'font-weight', css:'fontWeight', cur:['600','600'], kind:'weight', sug:[['700','700'],['800','800'],['900','900']] },
  ]},
  { el:'b', text:'make the button friendlier', cols:[
    { verb:'Change', prop:'background', css:'background', cur:['#141414','141414'], kind:'color', sug:[['#1F56D9','1F56D9'],['#2E7D32','2E7D32'],['#E58A2B','E58A2B']] },
    { verb:'Increase', prop:'border-radius', css:'borderRadius', cur:['4px','4px'], kind:'radius', sug:[['10px','10px'],['16px','16px'],['999px','pill']] },
    { verb:'Increase', prop:'padding', css:'padding', cur:['6px 12px','6 · 12'], kind:'pad', sug:[['8px 16px','8 · 16'],['10px 20px','10 · 20'],['12px 26px','12 · 26']] },
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
  const cols = d.querySelector('[data-cols]');
  cols.innerHTML = req.cols.map((c, i) => `
    <div class="st-col" data-col="${i}" style="--i:${i}">
      <div class="st-col-h">${esc(c.verb)} <b>${esc(c.prop)}</b></div>
      <div class="st-cur"><span>current</span>${sugLabel(c, c.cur)}</div>
      ${c.sug.map(s => `<button class="st-sug" data-act="sug" data-col="${i}" data-v="${esc(s[0])}">${sugLabel(c, s)}</button>`).join('')}
    </div>`).join('');
}
function select(d, elKey){
  d.querySelectorAll('.st-el').forEach(e => e.classList.toggle('is-sel', e.dataset.el === elKey));
}
function apply(d, btn){
  const req = REQ[d._st.req]; const col = req.cols[+btn.dataset.col];
  const target = d.querySelector(`[data-el="${req.el}"]`);
  const was = btn.classList.contains('is-on');
  btn.closest('.st-col').querySelectorAll('.st-sug').forEach(b => b.classList.remove('is-on'));
  if(was) target.style[col.css] = ''; else { target.style[col.css] = btn.dataset.v; btn.classList.add('is-on'); }
}
function resetStyles(d){ d.querySelectorAll('.st-el').forEach(e => e.removeAttribute('style')); }

/* Speak a request: mic bubble, typing, inference, palette. */
async function speak(d, i, tok, animate = true){
  const req = REQ[i]; d._st.req = i;
  const status = d.querySelector('[data-status]'); const mic = d.querySelector('[data-mic]'); const mt = d.querySelector('[data-mic-text]');
  const cols = d.querySelector('[data-cols]');
  d.querySelectorAll('[data-reqs] button').forEach(b => b.classList.toggle('is-on', +b.dataset.req === i));
  resetStyles(d); select(d, req.el);
  cols.classList.remove('is-in'); cols.innerHTML = '';
  mic.classList.add('is-on', 'is-listening'); status.textContent = 'Listening…';
  if(animate) await typeInto(mt, req.text, tok, 30); else mt.textContent = req.text;
  mic.classList.remove('is-listening');
  status.textContent = 'Finding properties for the ' + EL_NAME[req.el] + '…'; status.classList.add('is-busy');
  await sleep(animate ? 800 : 0, tok);
  status.classList.remove('is-busy'); status.textContent = `${req.cols.length} properties, ${req.cols.length * 3} suggestions`;
  renderCols(d, req);
  requestAnimationFrame(() => cols.classList.add('is-in'));
  await sleep(animate ? 500 : 0, tok);
}

export default {
  init(d){
    d._st = { req: 0 };
    d.querySelector('[data-reqs]').innerHTML = REQ.map((r, i) => `<button class="chip" data-act="req" data-req="${i}">${esc(r.text)}</button>`).join('');
    d.querySelector('[data-mic]').classList.remove('is-on');
  },
  async flow(d, tok){
    const c = cursor(d);
    await sleep(500, tok);
    const p = d.querySelector('[data-el="p"]');
    await c.show(d.querySelector('.st-nav'), tok);
    await c.moveTo(p, tok, 600); await c.click(tok);
    await speak(d, 0, tok);
    const pick = async sel => { const b = d.querySelector(sel); await c.moveTo(b, tok); await c.click(tok); apply(d, b); };
    await pick('[data-col="0"] .st-sug:nth-of-type(2)');
    await sleep(600, tok);
    await pick('[data-col="2"] .st-sug:nth-of-type(1)');
    await sleep(500, tok);
    c.hide();
    d.querySelector('[data-try]').classList.add('is-shown');
  },
  final(d){
    speak(d, 0, null, false);
    d.querySelector('[data-try]').classList.add('is-shown');
  },
  async act(d, el, tok){
    if(el.dataset.act === 'sug') apply(d, el);
    if(el.dataset.act === 'req'){ await speak(d, +el.dataset.req, tok, !reduced()); }
  },
};
