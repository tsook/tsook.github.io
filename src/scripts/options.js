/* Prototype-only controls. Shown when the URL contains ?options. Choices persist in localStorage. */
const OPTS = [
  {k:'theme', label:'Theme', vals:[['light','Light'],['dark','Dark'],['auto','Auto']], def:'light'},
  {k:'layout', label:'Layout', vals:[['side','Side column'],['top','Intro on top']], def:'side'},
  {k:'work', label:'Work', vals:[['list','One column'],['grid','Two columns']], def:'list'},
  {k:'intros', label:'Theme intro', vals:[['on','On'],['off','Off']], def:'on'},
  {k:'nav', label:'Navigation', vals:[['map','Minimap'],['list','Left list'],['none','None']], def:'map'},
  {k:'style', label:'Style', vals:[['flat','Flat'],['soft','Soft']], def:'flat'},
  {k:'posters', label:'Posters', vals:[['off','Hidden'],['on','Shown']], def:'off'},
  {k:'list', label:'Paper list', vals:[['images','Images'],['plain','Text only']], def:'images'},
];
const store = { get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
export function initOptions(){
  const state = Object.fromEntries(OPTS.map(o=>[o.k, store.get('tsk-'+o.k) || o.def]));
  const root = document.documentElement;
  function apply(){
    if(state.theme==='auto') root.removeAttribute('data-theme'); else root.dataset.theme = state.theme;
    root.classList.toggle('layout-top', state.layout==='top');
    root.classList.toggle('work-grid', state.work==='grid');
    root.classList.toggle('intros-off', state.intros==='off');
    root.classList.toggle('nav-map', state.nav==='map');
    root.classList.toggle('nav-list', state.nav==='list');
    root.classList.toggle('style-soft', state.style==='soft');
    root.classList.toggle('posters-off', state.posters==='off');
    root.classList.toggle('pubs-plain', state.list==='plain');
    document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('is-on', state[b.dataset.k]===b.dataset.v));
    document.dispatchEvent(new CustomEvent('options-change'));
  }
  const panel = document.getElementById('panel');
  const show = location.search.includes('options') || OPTS.some(o => store.get('tsk-'+o.k));
  if(panel && show){
    panel.hidden = false;
    document.getElementById('panel-body').innerHTML = OPTS.map(o=>`<div class="opt"><span class="ol">${o.label}</span><span class="seg">${o.vals.map(([v,l])=>`<button data-k="${o.k}" data-v="${v}">${l}</button>`).join('')}</span></div>`).join('') + `<div class="panel-note">Prototype controls, not part of the site.</div>`;
    panel.addEventListener('click', e => {
      if(e.target.closest('[data-panel-toggle]')){ panel.classList.toggle('is-open'); return; }
      const b = e.target.closest('.seg button'); if(!b) return;
      state[b.dataset.k] = b.dataset.v; store.set('tsk-'+b.dataset.k, b.dataset.v); apply();
    });
  }
  apply();
}
