/* Shared runtime for the figure demos.
   Each demo exposes a `flow(d, tok)` async function that walks the visitor through the
   system once, using the fake cursor and typing helpers. Any real click on the figure
   cancels the flow and hands control over. */
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const CANCEL = Symbol('cancel');

export function token(){
  const subs = new Set();
  const t = { cancelled:false, cancel(){ if(t.cancelled) return; t.cancelled = true; subs.forEach(f => f()); subs.clear(); }, on(f){ if(t.cancelled) f(); else subs.add(f); }, off(f){ subs.delete(f); } };
  return t;
}
export function sleep(ms, tok){
  return new Promise((res, rej) => {
    if(tok?.cancelled) return rej(CANCEL);
    const id = setTimeout(() => { tok?.off(stop); res(); }, ms);
    const stop = () => { clearTimeout(id); rej(CANCEL); };
    tok?.on(stop);
  });
}
/* Type text into an element, one character at a time. */
export async function typeInto(el, text, tok, cps = 38){
  el.textContent = '';
  el.classList.add('is-typing');
  if(reduced()){ el.textContent = text; el.classList.remove('is-typing'); return; }
  try {
    for(let i = 1; i <= text.length; i++){
      el.textContent = text.slice(0, i);
      await sleep(1000 / cps + (/[,.?!]/.test(text[i-1]) ? 120 : 0), tok);
    }
  } finally { el.textContent = text; el.classList.remove('is-typing'); }
}
/* Reveal an element's text word by word (streaming output). */
export async function stream(el, text, tok, wps = 22){
  const words = text.split(' ');
  el.textContent = '';
  if(reduced()){ el.textContent = text; return; }
  try {
    for(let i = 1; i <= words.length; i++){
      el.textContent = words.slice(0, i).join(' ');
      await sleep(1000 / wps, tok);
    }
  } finally { el.textContent = text; }
}
/* Fake cursor: one per figure, moved to element centers. */
export function cursor(d){
  let c = d.querySelector('.fcur');
  if(!c){ c = document.createElement('i'); c.className = 'fcur'; c.setAttribute('aria-hidden','true'); d.appendChild(c); }
  const at = (el, dx = 0, dy = 0) => {
    const b = d.getBoundingClientRect(), r = el.getBoundingClientRect();
    c.style.transform = `translate(${r.left - b.left + r.width/2 + dx}px, ${r.top - b.top + r.height/2 + dy}px)`;
  };
  return {
    el: c,
    async show(el, tok){ at(el); c.classList.add('is-on'); await sleep(40, tok); },
    async moveTo(el, tok, ms = 420){ if(reduced()) ms = 0; c.style.transitionDuration = ms + 'ms'; at(el); await sleep(ms + 60, tok); },
    async click(tok){ c.classList.add('is-down'); await sleep(110, tok); c.classList.remove('is-down'); await sleep(60, tok); },
    hide(){ c.classList.remove('is-on'); },
  };
}
/* Run a flow with cancellation; swallow the cancel sentinel. */
export async function run(fn, tok){
  try { await fn(tok); return true; }
  catch(e){ if(e !== CANCEL) console.error(e); return false; }
}
