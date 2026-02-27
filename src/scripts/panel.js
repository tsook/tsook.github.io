/**
 * Panel state management
 *
 * State machine:
 *   currentPaperId  — paper currently showing (null if none)
 *   pinnedId        — paper locked by click (null if only hovering)
 *
 * Key invariant: showPaperDetail() is a no-op if the paper is already
 * showing, so clicking after hovering just promotes to pinned without
 * re-triggering any animation.
 */

import { scrambleResolve } from './text-scramble.js';

let pinnedId = null;
let currentPaperId = null;
let hoverDebounce = null;
let activeScrambleCancellers = [];
// Incremented on every cancel — onArrive callbacks check this to
// avoid running after the detail has been closed/switched.
let scrambleGeneration = 0;
let isTouch = false;

window.addEventListener('touchstart', () => {
  isTouch = true;
}, { passive: true, once: true });

export function initPanelManager() {
  const detailOverlay = document.getElementById('detail-overlay');
  const detailBody = document.getElementById('detail-body');
  const detailBack = document.getElementById('detail-back');
  const cardGrid = document.getElementById('research-grid');

  if (!detailOverlay || !detailBody) return;

  const detailWraps = detailBody.querySelectorAll('.paper-detail-wrap[data-detail-id]');

  function getFragmentSystem() {
    return window.__fragmentSystem || null;
  }

  function hideAllDetails() {
    detailWraps.forEach(wrap => { wrap.style.display = 'none'; });
  }

  function computeClearZoneRect() {
    const canvas = document.getElementById('fragment-canvas');
    if (!canvas) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const overlayRect = detailOverlay.getBoundingClientRect();
    return {
      x: overlayRect.left - canvasRect.left,
      y: overlayRect.top - canvasRect.top,
      width: overlayRect.width,
      height: overlayRect.height,
    };
  }

  function cancelScrambles() {
    scrambleGeneration++;                        // invalidate pending onArrive callbacks
    activeScrambleCancellers.forEach(fn => fn()); // restore all elements to original HTML
    activeScrambleCancellers = [];
  }

  // Build per-element phantom targets from DOM measurements.
  // Each element is immediately flooded with noise; the onArrive callback
  // triggers the scramble-resolve as the phantom lands on that element.
  function computePhantomTargets(wrap, canvasRect) {
    const targets = [];
    const myGeneration = scrambleGeneration;

    function addTarget(selector, count, flightMs, scrDuration) {
      const el = wrap.querySelector(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Top-left of element in canvas space, plus full dimensions for distribution
      const canvasX = r.left - canvasRect.left;
      const canvasY = r.top - canvasRect.top;
      const canvasW = r.width;
      const canvasH = r.height;

      const originalHTML = el.innerHTML;

      // Invisible while phantom is in flight; snaps visible on arrival
      el.style.opacity = '0';
      activeScrambleCancellers.push(() => {
        el.style.opacity = '';
        el.innerHTML = originalHTML;
      });

      targets.push({
        canvasX, canvasY, canvasW, canvasH, count,
        duration: flightMs,
        onArrive: () => {
          if (scrambleGeneration !== myGeneration) return;
          el.innerHTML = originalHTML;
          el.style.opacity = '1';
          activeScrambleCancellers.push(
            scrambleResolve(el, { duration: scrDuration, delay: 0 })
          );
        },
      });
    }

    addTarget('.paper-detail-title', 8, 300, 600);
    addTarget('.paper-detail-venue', 4, 500, 400);
    addTarget('.paper-detail-authors', 6, 900, 500);
    addTarget('.paper-detail-description', 8, 1300, 400);

    return targets;
  }

  // ── Core show/hide ──

  // Show a paper with the full animation.
  // No-op if this paper is already showing — prevents re-animation on click-after-hover.
  function showPaperDetail(paperId) {
    if (paperId === currentPaperId) return;

    cancelScrambles();
    hideAllDetails();
    const wrap = detailBody.querySelector(`.paper-detail-wrap[data-detail-id="${paperId}"]`);
    if (!wrap) return;

    wrap.style.display = 'block';
    currentPaperId = paperId;

    detailOverlay.classList.add('visible');
    detailBody.scrollTop = 0;

    // Lock background scrolling on mobile
    if (window.innerWidth <= 768) {
      document.body.classList.add('detail-open');
    }

    const fs = getFragmentSystem();
    if (fs && window.innerWidth > 768) {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('fragment-canvas');
        const canvasRect = canvas?.getBoundingClientRect();
        const czRect = computeClearZoneRect();
        fs.morphToPaper(paperId, czRect);
        if (canvasRect) {
          const targets = computePhantomTargets(wrap, canvasRect);
          fs.spawnTargetedPhantoms(targets);
        }
      });
    }

    // specific fix: force gif and lottie replays
    const teaserImg = wrap.querySelector('.paper-detail-teaser.lottie-teaser');
    if (teaserImg) {
      // Replay Lottie
      teaserImg.seek(0);
      teaserImg.play();
    } else {
      const img = wrap.querySelector('.paper-detail-teaser');
      if (img && img.src.includes('.gif')) {
        const url = new URL(img.src, window.location.href);
        url.searchParams.set('t', Date.now());
        img.src = url.toString();
      }
    }
  }

  function hidePaperDetail() {
    detailOverlay.classList.remove('visible', 'pinned');
    document.body.classList.remove('detail-open');
    cancelScrambles();
    currentPaperId = null;
    pinnedId = null;

    clearActiveStates();
    if (cardGrid) cardGrid.classList.remove('has-selection');
    document.dispatchEvent(new CustomEvent('card-selection-change'));

    const fs = getFragmentSystem();
    if (fs) fs.morphToAmbient();
  }



  // ── Helpers ──

  function clearActiveStates() {
    document.querySelectorAll('.grid-tile.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.pub-item.active').forEach(el => el.classList.remove('active'));
  }

  // ── Hover ──

  function handleHoverIn(paperId) {
    if (pinnedId || isTouch || window.innerWidth <= 768) return;
    clearTimeout(hoverDebounce);
    hoverDebounce = setTimeout(() => {
      showPaperDetail(paperId);
    }, 80);
  }

  function handleHoverOut() {
    clearTimeout(hoverDebounce);
    if (pinnedId || isTouch || window.innerWidth <= 768) return;
    hoverDebounce = setTimeout(() => {
      if (!pinnedId) hidePaperDetail();
    }, 150);
  }

  // ── Click ──

  function handleClick(paperId, triggerEl) {
    // Already pinned to this paper → unpin
    if (pinnedId === paperId) {
      hidePaperDetail();
      return;
    }

    clearActiveStates();
    pinnedId = paperId;

    if (triggerEl) triggerEl.classList.add('active');
    document.querySelectorAll(`.grid-tile[data-paper-id="${paperId}"]`).forEach(el => el.classList.add('active'));
    if (cardGrid) cardGrid.classList.add('has-selection');
    document.dispatchEvent(new CustomEvent('card-selection-change'));

    // showPaperDetail is a no-op if already showing (hover case) —
    // just promotes to pinned by adding the class below.
    showPaperDetail(paperId);
    detailOverlay.classList.add('pinned');
  }

  // ── Event delegation ──

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.grid-tile[data-paper-id]');
    if (card) { handleHoverIn(card.dataset.paperId); return; }
    const pubItem = e.target.closest('.pub-item[data-paper-id]');
    if (pubItem) { handleHoverIn(pubItem.dataset.paperId); return; }
  });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.grid-tile[data-paper-id]');
    const pubItem = e.target.closest('.pub-item[data-paper-id]');
    if (card || pubItem) {
      const related = e.relatedTarget;
      if (related && (related.closest('.grid-tile[data-paper-id]') || related.closest('.pub-item[data-paper-id]'))) return;
      handleHoverOut();
    }
  });

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.grid-tile[data-paper-id]');
    if (card) { e.preventDefault(); handleClick(card.dataset.paperId, card); return; }
    const pubItem = e.target.closest('.pub-item[data-paper-id]');
    if (pubItem) {
      if (e.target.closest('a[href]')) return; // Allow paper link buttons to navigate
      e.preventDefault();
      handleClick(pubItem.dataset.paperId, pubItem);
      return;
    }
  });

  // ── Bio keyword highlights ──

  const bioKeywords = document.querySelectorAll('.bio-keyword');
  if (bioKeywords.length > 0 && cardGrid) {
    bioKeywords.forEach(kw => {
      kw.addEventListener('mouseenter', () => {
        const group = kw.dataset.highlight;
        if (!group) return;
        cardGrid.classList.add('highlight-active');
        cardGrid.classList.add(`highlight-${group.replace('dis-', '')}`);
        cardGrid.querySelectorAll(`.${group}`).forEach(t => t.classList.add('highlighted'));
      });
      kw.addEventListener('mouseleave', () => {
        const group = kw.dataset.highlight;
        if (!group) return;
        cardGrid.classList.remove('highlight-active');
        cardGrid.classList.remove(`highlight-${group.replace('dis-', '')}`);
        cardGrid.querySelectorAll(`.${group}`).forEach(t => t.classList.remove('highlighted'));
      });
    });
  }

  // ── Misc ──

  if (detailBack) detailBack.addEventListener('click', hidePaperDetail);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (pinnedId) hidePaperDetail();
    }
  });

  window.addEventListener('resize', () => {
    if (!detailOverlay.classList.contains('visible')) return;
    const fs = getFragmentSystem();
    if (!fs || !fs.clearZone) return;
    const czRect = computeClearZoneRect();
    if (czRect) fs.updateClearZone(czRect);
  });
}
