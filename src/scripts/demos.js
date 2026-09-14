const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const CG_OUTS = [
  ['"Easy," I muttered, heart in my throat.','I plunged into the snow and flailed.','My elbow met something soft and cold.'],
  ['I stood still and listened to the dark.','My sleeve was wet where the fingers had been.','"Hello?" The word came back twice.'],
];
const EV_WHY = [
  'Both map photosynthesis onto eating and breathing. A tie.',
  'Prompt 2 gives the leaf a name and a voice. Prompt 1 reads like a definition.',
  'Prompt 1 keeps the inputs straight. Prompt 2 has the leaf gulp water from its roots.',
  'Both stay within a five-year-old\'s words.',
];
const EV_NAME = ['Concept familiarity','Engagingness','Scientific accuracy','Child vocabulary'];
const ET_FRAGS = [
  {pol:'pos', fn:'Answers the question directly'},
  {pol:'pos', fn:'States a safety condition'},
  {pol:'pos', fn:'Gives a practical tip'},
  {pol:'pos', fn:'Sets a storage limit'},
  {pol:'neg', fn:'Contradicts the safety advice'},
  {pol:'pos', fn:'States a safety condition'},
];
const CU = [
  {pref:'Technical specifications first, then creative suggestions.', ok:false, why:'The lens is not part of the current request, so this preference stays dormant.'},
  {pref:'Observational detail, no artificial drama.', ok:true, why:'Same channel, so the same rule applies to the new segment.'},
];

function renderLens(d, animate){
  const chain = +d.querySelector('.chain.is-linked').dataset.chain;
  const view = d.querySelector('.lens-sw .is-on').dataset.lens;
  const box = d.querySelector('[data-lensbox]');
  const paint = () => {
    if(view==='list') box.innerHTML = `<div class="lens-list">${CG_OUTS[chain].map(o=>`<div class="li"><i></i><span>${esc(o)}</span></div>`).join('')}</div>`;
    else box.innerHTML = `<svg class="lens-space" viewBox="0 0 200 96">${[[50,40],[140,30],[100,70],[26,80],[170,74],[80,20],[126,54],[60,60],[176,26],[112,88]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i<3?4.5:3}" fill="${i<3?'var(--blue-4)':'var(--blue-2)'}"></circle>`).join('')}</svg>`;
    box.classList.remove('is-swapping');
  };
  if(animate && !reduced()){ box.classList.add('is-swapping'); setTimeout(paint,150); } else paint();
}
function wire(d){
  const svg = d.querySelector('.cg-wires'); if(!svg) return;
  const b = d.getBoundingClientRect();
  const P = r => ({l:r.left-b.left, r:r.right-b.left, cy:r.top-b.top+r.height/2});
  const g = P(d.querySelector('[data-gen]').getBoundingClientRect());
  const L = P(d.querySelector('[data-lensbox]').getBoundingClientRect());
  let s = '';
  d.querySelectorAll('.chain').forEach(ch => {
    const c = P(ch.getBoundingClientRect()); const on = ch.classList.contains('is-linked');
    const mx=(c.r+g.l)/2;
    s += `<path d="M${c.r},${c.cy} C${mx},${c.cy} ${mx},${g.cy} ${g.l},${g.cy}" fill="none" stroke="${on?'var(--blue-4)':'var(--blue-2)'}" stroke-width="${on?1.75:1}" opacity="${on?1:.55}"></path>`;
  });
  const mx=(g.r+L.l)/2;
  s += `<path d="M${g.r},${g.cy} C${mx},${g.cy} ${mx},${L.cy} ${L.l},${L.cy}" fill="none" stroke="var(--blue-4)" stroke-width="1.75"></path>`;
  svg.innerHTML = s;
}
function setCrit(d, i){
  d.querySelectorAll('.crit-row').forEach(r=>r.classList.toggle('is-on', +r.dataset.c===i));
  d.querySelectorAll('.eo span[data-c]').forEach(sp=>sp.classList.toggle('is-hl', +sp.dataset.c===i));
  d.querySelector('[data-expl]').innerHTML = `<b>${esc(EV_NAME[i])}.</b> ${esc(EV_WHY[i])}`;
}
function setFrag(d, i){
  const f = ET_FRAGS[i];
  d.querySelectorAll('.frag').forEach(x=>x.classList.toggle('is-on', +x.dataset.i===i));
  d.querySelector('[data-etd]').innerHTML = `<span class="fnl ${f.pol}">${esc(f.fn)}</span><span class="rated">${f.pol==='pos'?'rated positively':'rated negatively'}</span>`;
}
function renderCupid(d, i, animate){
  const s = CU[i]; const box = d.querySelector('[data-cupref]');
  d.querySelectorAll('[data-act="cusess"]').forEach(b=>b.classList.toggle('is-on', +b.dataset.s===i));
  const paint = () => {
    box.innerHTML = `<div><span class="k2">preference from session ${i===0?1:7}</span>${esc(s.pref)}</div><div><span class="verdict ${s.ok?'yes':'no'}">${s.ok?'applies now':'not now'}</span>${esc(s.why)}</div>`;
    box.classList.remove('is-swapping');
  };
  if(animate && !reduced()){ box.classList.add('is-swapping'); setTimeout(paint,150); } else paint();
}
function setStep(d, s){
  d.querySelector('[data-step]').dataset.step = s;
  d.querySelectorAll('[data-turn]').forEach(r=>r.classList.toggle('is-shown', +r.dataset.turn<=s));
  const n = k => d.querySelector(`[data-n="${k}"]`);
  ['perspective','second','tone','tender'].forEach(k=>{ const e=n(k); if(e) e.classList.remove('found','new','emerging'); });
  if(s===2) n('perspective')?.classList.add('emerging');
  if(s>=3){ n('perspective')?.classList.add('new'); n('second')?.classList.add('new'); }
  d.querySelectorAll('[data-prog] i').forEach((b,i)=>{ b.className = i===0 ? 'on' : (s>=3 && i<3 ? 'new' : ''); });
  d.querySelector('[data-dlk]').textContent = `${s} of 3`;
  d.querySelector('[data-act="step"]').textContent = s>=3 ? 'Start over' : 'Next turn';
}
function initDemo(d){
  const id = d.dataset.demo;
  if(id==='cgl'){ renderLens(d,false); requestAnimationFrame(()=>wire(d)); }
  if(id==='cupid') renderCupid(d,1,false);
  if(id==='discover') setStep(d,1);
  if(id==='evalet') setFrag(d,1);
  if(id==='evallm') setCrit(d,1);
}
export function initDemos(){
  document.querySelectorAll('[data-demo]').forEach(initDemo);
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if(!el) return;
    const d = el.closest('[data-demo]'); if(!d) return;
    const act = el.dataset.act;
    if(act==='st'){
      const target = d.querySelector('[data-target]'); const prop = {color:'color', font:'fontFamily', size:'fontSize'}[el.dataset.p];
      const was = el.classList.contains('is-on');
      el.closest('.sg').querySelectorAll('button').forEach(b=>b.classList.remove('is-on'));
      if(was){ target.style[prop]=''; } else { target.style[prop]=el.dataset.v; el.classList.add('is-on'); }
    }
    if(act==='chain'){ d.querySelectorAll('.chain').forEach(c=>c.classList.toggle('is-linked', c===el)); renderLens(d,true); wire(d); }
    if(act==='lens'){ d.querySelectorAll('[data-act="lens"]').forEach(b=>b.classList.toggle('is-on', b===el)); renderLens(d,true); }
    if(act==='ecrit') setCrit(d, +el.dataset.c);
    if(act==='frag') setFrag(d, +el.dataset.i);
    if(act==='cusess') renderCupid(d, +el.dataset.s, true);
    if(act==='step'){ const s=+d.querySelector('[data-step]').dataset.step; setStep(d, s>=3 ? 1 : s+1); }
  });
  const rewire = () => document.querySelectorAll('[data-demo="cgl"]').forEach(wire);
  window.addEventListener('resize', rewire);
  document.addEventListener('options-change', () => requestAnimationFrame(rewire));
  if(document.fonts) document.fonts.ready.then(rewire);
}
