/* Figure demos. Each module exports init(d), flow(d, tok), final(d), act(d, el, tok).
   The flow plays once when the figure scrolls into view, then the figure is interactive.
   Any click on a control cancels the flow and runs the action. */
import { token, run, reduced } from './flow.js';
import stylette from './demos/stylette.js';
import cells from './demos/cells.js';
import evallm from './demos/evallm.js';
import evalet from './demos/evalet.js';
import cupid from './demos/cupid.js';
import discover from './demos/discover.js';

const REG = { stylette, cells, evallm, evalet, cupid, discover };
const REPLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.6 1.9v3.3h-3.3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function setup(d){
  const mod = REG[d.dataset.demo]; if(!mod) return;
  const ctl = { tok:null, played:false };
  mod.init(d);
  const rb = document.createElement('button');
  rb.className = 'fig-replay'; rb.type = 'button'; rb.setAttribute('aria-label', 'Replay the walkthrough'); rb.title = 'Replay'; rb.innerHTML = REPLAY;
  d.appendChild(rb);
  const stop = () => { if(ctl.tok){ ctl.tok.cancel(); ctl.tok = null; } d.classList.remove('is-playing'); d.querySelector('.fcur')?.classList.remove('is-on'); };
  const play = () => {
    stop(); ctl.played = true;
    if(reduced()){ mod.final(d); d.classList.add('is-played'); return; }
    ctl.tok = token(); d.classList.add('is-playing');
    const t = ctl.tok;
    run(tk => mod.flow(d, tk), t).then(() => { if(ctl.tok === t){ ctl.tok = null; d.classList.remove('is-playing'); } d.classList.add('is-played'); });
  };
  rb.addEventListener('click', e => { e.stopPropagation(); play(); });
  d.addEventListener('click', e => {
    if(e.target.closest('.fig-replay')) return;
    const el = e.target.closest('[data-act]'); if(!el) return;
    stop();
    d.classList.add('is-played');
    ctl.tok = token(); const t = ctl.tok;
    run(tk => mod.act(d, el, tk), t).then(() => { if(ctl.tok === t) ctl.tok = null; });
  });
  if(!('IntersectionObserver' in window)){ mod.final(d); d.classList.add('is-played'); return; }
  const io = new IntersectionObserver(es => { es.forEach(en => { if(en.isIntersecting && !ctl.played){ play(); io.disconnect(); } }); }, { threshold: 0.55 });
  io.observe(d);
}
export function initDemos(){ document.querySelectorAll('[data-demo]').forEach(setup); }
