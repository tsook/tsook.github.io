/* Figure demos. Each module exports init(d), flow(d, tok), final(d), act(d, el, tok), and
   optionally clean(d) to settle its own transient state after a cancel.
   A figure's walkthrough plays once, when the visitor reaches it: figures in view queue up and
   play one at a time in page order. Any click on a control cancels the flow and runs the action. */
import { token, run, reduced } from './flow.js';
import stylette from './demos/stylette.js';
import cells from './demos/cells.js';
import evallm from './demos/evallm.js';
import evalet from './demos/evalet.js';
import cupid from './demos/cupid.js';
import discover from './demos/discover.js';

const REG = { stylette, cells, evallm, evalet, cupid, discover };
const TRANSIENT = ['is-running', 'is-flowing', 'is-scan', 'is-busy', 'is-listening', 'is-typing', 'is-down'];
const REPLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.6 1.9v3.3h-3.3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* one walkthrough at a time, in page order */
const sched = { playing: null, waiting: new Set(), timer: 0 };
/* deferred so every observer in the same batch registers first; prefer figures whose top is on screen, then page order */
function next(){
  if(sched.timer) return;
  sched.timer = setTimeout(() => {
    sched.timer = 0;
    if(sched.playing) return;
    const cands = [...sched.waiting].filter(d => !d._ctl.played && d._ctl.inView);
    if(!cands.length) return;
    const key = d => { const t = d.getBoundingClientRect().top; return (t < 0 ? 1e6 : 0) + t; };
    cands.sort((a, b) => key(a) - key(b));
    sched.waiting.delete(cands[0]); cands[0]._play();
  }, 60);
}

function setup(d){
  const mod = REG[d.dataset.demo]; if(!mod) return;
  const ctl = { tok:null, played:false, inView:false, io:null };
  d._ctl = ctl;
  mod.init(d);
  const rb = document.createElement('button');
  rb.className = 'fig-replay'; rb.type = 'button'; rb.setAttribute('aria-label', 'Replay the walkthrough'); rb.title = 'Replay'; rb.innerHTML = REPLAY;
  d.appendChild(rb);
  const stop = () => {
    if(ctl.tok){ ctl.tok.cancel(); ctl.tok = null; }
    d.classList.remove('is-playing');
    d.querySelector('.fcur')?.classList.remove('is-on');
    TRANSIENT.forEach(c => d.querySelectorAll('.' + c).forEach(el => el.classList.remove(c)));
    mod.clean?.(d);
    if(sched.playing === d){ sched.playing = null; next(); }
  };
  const play = () => {
    stop(); ctl.played = true; sched.waiting.delete(d);
    if(reduced()){ mod.final(d); d.classList.add('is-played'); return; }
    ctl.tok = token(); d.classList.add('is-playing'); sched.playing = d;
    const t = ctl.tok;
    run(tk => mod.flow(d, tk), t).then(() => {
      if(ctl.tok === t){ ctl.tok = null; d.classList.remove('is-playing'); }
      d.classList.add('is-played');
      if(sched.playing === d){ sched.playing = null; next(); }
    });
  };
  d._play = play;
  rb.addEventListener('click', e => { e.stopPropagation(); play(); });
  const onAct = el => {
    stop();
    ctl.played = true; sched.waiting.delete(d);
    d.classList.add('is-played');
    ctl.tok = token(); const t = ctl.tok;
    run(tk => mod.act(d, el, tk), t).then(() => { if(ctl.tok === t) ctl.tok = null; });
  };
  d.addEventListener('click', e => {
    if(e.target.closest('.fig-replay')) return;
    const el = e.target.closest('[data-act]'); if(!el) return;
    onAct(el);
  });
  /* keyboard for non-button controls (SVG groups) */
  d.addEventListener('keydown', e => {
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest?.('[data-act]'); if(!el || el.tagName === 'BUTTON') return;
    e.preventDefault(); onAct(el);
  });
  if(!('IntersectionObserver' in window)){ mod.final(d); d.classList.add('is-played'); return; }
  /* tall stacked figures on phones can never reach 60 percent, so scale the threshold to the viewport */
  const th = Math.min(0.6, Math.max(0.2, (window.innerHeight * 0.6) / Math.max(1, d.offsetHeight)));
  ctl.io = new IntersectionObserver(es => {
    es.forEach(en => {
      ctl.inView = en.isIntersecting;
      if(en.isIntersecting && !ctl.played){ sched.waiting.add(d); next(); }
      else if(!en.isIntersecting){
        sched.waiting.delete(d);
        /* scrolled away mid-walkthrough: settle this figure and let the next one start */
        if(sched.playing === d){ stop(); mod.final(d); d.classList.add('is-played'); ctl.played = true; ctl.io?.disconnect(); }
      }
    });
  }, { threshold: th });
  ctl.io.observe(d);
}
export function initDemos(){ document.querySelectorAll('[data-demo]').forEach(setup); }
