/**
 * Text scramble-resolve effect for DOM elements.
 * Mirrors the canvas fragment glitch aesthetic.
 *
 * Key behaviour:
 *   - Element content is immediately replaced with noise (no invisible period)
 *   - After `delay` ms, characters progressively resolve to real text
 *   - HTML markup (bold, links) is restored on completion
 */

const SCRAMBLE_CHARS = '░▒▓█│─┌┐└┘├┤┬┴┼·∙!@#$%^&*';

function randomScrambleChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Immediately replace element's text content with noise.
 * Returns a restore function that puts the original HTML back.
 * Use this to pre-flood elements before phantom fragments arrive.
 * @param {HTMLElement} element
 * @returns {() => void} restore function
 */
export function setNoise(element) {
  const originalHTML = element.innerHTML;
  const text = element.textContent || '';
  if (!text.trim()) return () => {};
  element.textContent = text.split('').map(c => c === ' ' ? ' ' : randomScrambleChar()).join('');
  return () => { element.innerHTML = originalHTML; };
}

/**
 * @param {HTMLElement} element
 * @param {{ duration?: number, delay?: number }} opts
 *   delay — time to stay as pure noise before resolving starts
 * @returns {() => void} cancel function
 */
export function scrambleResolve(element, { duration = 600, delay = 0 } = {}) {
  const originalHTML = element.innerHTML;
  const original = element.textContent || '';
  if (!original.trim()) return () => {};

  const chars = original.split('');
  const len = chars.length;

  // Shuffled reveal order (spaces skipped)
  const indices = [];
  for (let i = 0; i < len; i++) {
    if (chars[i] !== ' ') indices.push(i);
  }
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const resolved = new Array(len).fill(false);
  for (let i = 0; i < len; i++) {
    if (chars[i] === ' ') resolved[i] = true;
  }

  // ── Immediately show noise (before any delay) ──
  element.textContent = chars.map(c => c === ' ' ? ' ' : randomScrambleChar()).join('');

  let intervalId = null;
  let timeoutId = null;
  let cancelled = false;

  function start() {
    if (cancelled) return;
    const startTime = performance.now();
    let revealIdx = 0;

    intervalId = setInterval(() => {
      if (cancelled) { clearInterval(intervalId); return; }

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const targetRevealed = Math.floor(progress * indices.length);
      while (revealIdx < targetRevealed) {
        resolved[indices[revealIdx]] = true;
        revealIdx++;
      }

      element.textContent = chars.map((ch, i) => resolved[i] ? ch : randomScrambleChar()).join('');

      if (progress >= 1) {
        clearInterval(intervalId);
        // Restore original HTML (preserves bold, links, etc.)
        element.innerHTML = originalHTML;
      }
    }, 16);
  }

  timeoutId = setTimeout(start, delay);

  return function cancel() {
    cancelled = true;
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    element.innerHTML = originalHTML;
  };
}
