/* The three linked phrases in the bio hint their theme section on hover and are marked
   while that section is on screen. */
export function initBio(){
  const phrases = [...document.querySelectorAll('.tl')];
  if(!phrases.length) return;
  phrases.forEach(a => {
    const sec = () => document.getElementById('t-' + a.dataset.theme);
    const on = () => sec()?.classList.add('is-hinted'), off = () => sec()?.classList.remove('is-hinted');
    a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });
  const themes = [...document.querySelectorAll('.theme[id]')];
  let raf = 0;
  const spy = () => {
    const pos = window.scrollY + window.innerHeight * 0.3;
    let cur = null;
    themes.forEach(t => { if(t.getBoundingClientRect().top + window.scrollY - 8 <= pos) cur = t; });
    const pubs = document.getElementById('publications');
    if(pubs && pubs.getBoundingClientRect().top + window.scrollY - 8 <= pos) cur = null;
    const tid = cur ? cur.id.replace(/^t-/, '') : null;
    phrases.forEach(a => a.classList.toggle('is-current', a.dataset.theme === tid));
  };
  window.addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; spy(); }); }, { passive:true });
  spy();
}
