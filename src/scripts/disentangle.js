// ============================================
// disentangle.js — Research sentence → Research Grid
// 3-Phase Animation: Shimmer -> Grid Lines -> Labels -> Tiles
// ============================================

function pause(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Plot Grid Animation 3-Phase ────────────────────

async function plotGrid(gridEl) {
  // Phase 1: Draw Grid Lines
  gridEl.classList.add('lines-visible');
  await pause(600); // Wait for lines to draw

  // Phase 2: Fade in Axis Labels
  gridEl.classList.add('labels-visible');
  await pause(300); // Partial overlap with tiles

  // Phase 3: Plot Tiles (Staggered)
  const tiles = gridEl.querySelectorAll('.grid-tile');
  // Sort tiles by reading order (top-left to bottom-right) if not already
  // But strictly, DOM order should match grid order roughly.
  // Let's just animate them in DOM order.

  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('revealed');
    }, i * 100);
  });
}

// ── Main entry point ───────────────────────────────

export function initDisentangle() {
  const trigger = document.querySelector('.disentangle-trigger');
  const researchGrid = document.getElementById('research-grid');
  const cardSection = document.getElementById('card-hand-section');
  const moreBtn = document.getElementById('disentangle-more');
  const pubList = document.getElementById('pub-list-section');
  const backBtn = document.getElementById('back-to-cards');

  if (!trigger || !researchGrid) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Reduced motion: skip animation, show everything ──
  if (reducedMotion) {
    researchGrid.classList.add('lines-visible', 'labels-visible');
    researchGrid.querySelectorAll('.grid-tile').forEach(t => t.classList.add('revealed'));
    if (moreBtn) moreBtn.classList.add('visible');
    return;
  }

  let fired = false;

  async function runSequence() {
    if (fired) return;
    fired = true;

    // Trigger CSS shimmer animation on bio keywords
    trigger.classList.add('shimmering');

    // Wait for shimmering to propagate
    await pause(600);

    // Show "Show All" link in header BEFORE grid plots
    const gridHeader = document.getElementById('grid-header');
    if (gridHeader) {
      gridHeader.classList.add('visible');
    }
    await pause(100);

    // Plot the grid
    if (cardSection) cardSection.style.visibility = 'visible'; // Ensure section is visible
    await plotGrid(researchGrid);

    // Cleanup shimmer
    await pause(800);
    trigger.classList.remove('shimmering');
    trigger.classList.add('revealed');

    if (moreBtn) {
      moreBtn.classList.add('visible');
    }

    document.dispatchEvent(new CustomEvent('disentangle-complete'));
  }

  // Auto-fire after 0.2s (reduced from 2.0s)
  const timer = setTimeout(runSequence, 200);

  // Or immediately on click
  trigger.addEventListener('click', () => {
    clearTimeout(timer);
    runSequence();
  });

  // ── "Show All" / "Back to selected" toggle ──

  let showingList = false;

  function showList() {
    showingList = true;
    if (cardSection) cardSection.style.display = 'none';
    // We don't change text anymore, we hide the section containing the button

    if (pubList) {
      pubList.classList.remove('hidden');
      // Simple stagger reveal for list items
      const items = pubList.querySelectorAll('.pub-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(6px)';
        item.style.transition = 'none';
        requestAnimationFrame(() => {
          setTimeout(() => {
            item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 30 + i * 20);
        });
      });
    }
  }

  function showCards() {
    showingList = false;
    if (pubList) pubList.classList.add('hidden');
    if (cardSection) cardSection.style.display = '';
    // cardSection contains the header and button, so they reappear
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      showList(); // Only one way now
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', showCards);
  }
}
